import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Optional, Scope } from '@nestjs/common';
import { Prisma } from '@confora/database';
import { isRevokePostReviewDuePeriod } from '@confora/shared-types';

import type { AuthenticatedActor } from '../auth/request-principal';
import { TenantContextStore } from '../tenant/tenant-context.store';
import {
  AuditError,
  AUDIT_ACTOR_REQUIRED,
  AUDIT_APPEND_FAILED,
  AUDIT_IDEMPOTENCY_CONFLICT,
  AUDIT_METADATA_INVALID,
  AUDIT_RETRY_EXHAUSTED,
  AUDIT_TENANT_CONTEXT_MISMATCH,
} from './audit-errors';
import {
  AuditEventRegistry,
  ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES,
  validateRoleAdministrationAuditMetadata,
  type RoleAdministrationAuditEventType,
} from './audit-event.registry';
import {
  INITIAL_PREV_HASH,
  MAX_SERIALIZABLE_RETRIES,
  RETRYABLE_PRISMA_ERROR_CODE,
  type AuditAppendInput,
  type AuditEventView,
  type AuditTransactionOps,
} from './audit-event.types';
import { AuditHashService } from './audit-hash.service';
import { buildIdempotencyFingerprint, fingerprintsEqual } from './audit-idempotency';
import { AuditPersistenceApi, AuditRepository, type AuditEventRow } from './audit.repository';
import { canonicalizeMetadata } from './audit-canonicalizer';
import {
  enforceResourceTypePolicy,
  parseAuditAppendInput,
  validateMetadataForEvent,
} from './audit-validators';

export const AUDIT_EVENT_REGISTRY = 'AUDIT_EVENT_REGISTRY' as const;

function isRoleAdministrationAuditEvent(
  eventType: string,
): eventType is RoleAdministrationAuditEventType {
  return (ROLE_ADMINISTRATION_AUDIT_EVENT_TYPES as readonly string[]).includes(eventType);
}

/**
 * PKG-00 events keep the generic allowlist and then the role-administration
 * semantic validator. Other events return the allowlisted metadata unchanged.
 * Actor-tenant agreement and the PT24H revoke deadline are enforced here,
 * before any persistence call.
 */
function enforceRoleAdministrationAuditMetadata(
  eventType: string,
  rawMetadata: unknown,
  allowlistedMetadata: unknown,
  actorTenantId: string,
): unknown {
  if (!isRoleAdministrationAuditEvent(eventType)) {
    return allowlistedMetadata;
  }
  const semantic = validateRoleAdministrationAuditMetadata(eventType, rawMetadata);
  if (semantic['tenantId'] !== actorTenantId) {
    throw new AuditError(
      AUDIT_METADATA_INVALID,
      'Role audit metadata tenant does not match the actor tenant.',
    );
  }
  if (eventType === 'ROLE_REVOKE_APPLIED') {
    const occurredAt = semantic['occurredAt'];
    const reviewDueAt = semantic['reviewDueAt'];
    if (
      typeof occurredAt !== 'string' ||
      typeof reviewDueAt !== 'string' ||
      !isRevokePostReviewDuePeriod(occurredAt, reviewDueAt)
    ) {
      throw new AuditError(
        AUDIT_METADATA_INVALID,
        'Revoke review deadline must equal PT24H after occurredAt.',
      );
    }
  }
  return semantic;
}

function isPrismaKnownRequestError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return (
    typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
  );
}

function toView(row: AuditEventRow): AuditEventView {
  return Object.freeze({
    id: row.id,
    tenantId: row.tenantId,
    sequence: row.sequence,
    idempotencyKey: row.idempotencyKey,
    actorUserId: row.actorUserId,
    eventType: row.eventType,
    outcome: row.outcome,
    resourceType: row.resourceType,
    resourceId: row.resourceId,
    occurredAt: row.occurredAt,
    recordedAt: row.recordedAt,
    correlationId: row.correlationId,
    prevHash: row.prevHash,
    payloadHash: row.payloadHash,
    chainHash: row.chainHash,
  });
}

@Injectable({ scope: Scope.REQUEST })
export class AuditService {
  private readonly registry: AuditEventRegistry;

  constructor(
    private readonly repository: AuditRepository,
    private readonly hashService: AuditHashService,
    private readonly tenantContext: TenantContextStore,
    @Optional() @Inject(AUDIT_EVENT_REGISTRY) registry?: AuditEventRegistry,
  ) {
    this.registry = registry ?? AuditEventRegistry.production();
  }

  async append(actor: AuthenticatedActor, input: AuditAppendInput): Promise<AuditEventView> {
    return this.executeInTransaction(actor, async (ops) => ops.append(input));
  }

  async executeInTransaction<T>(
    actor: AuthenticatedActor,
    work: (ops: AuditTransactionOps) => Promise<T>,
  ): Promise<T> {
    this.assertActor(actor);
    this.assertTenantAgreement(actor);

    return this.withSerializableRetry(async () =>
      this.repository.runSerializableTransaction(async (api) => {
        const ops: AuditTransactionOps = {
          append: (rawInput) => this.appendWithin(api, actor, rawInput),
        };
        return work(ops);
      }),
    );
  }

  private async appendWithin(
    api: AuditPersistenceApi,
    actor: AuthenticatedActor,
    rawInput: AuditAppendInput,
  ): Promise<AuditEventView> {
    const input = parseAuditAppendInput(rawInput);
    const definition = this.registry.get(input.eventType);
    const resourceType = enforceResourceTypePolicy(definition, input.resourceType);
    const resourceId =
      input.resourceId === undefined || input.resourceId === null || input.resourceId === ''
        ? null
        : input.resourceId;
    const correlationId =
      input.correlationId === undefined ||
      input.correlationId === null ||
      input.correlationId === ''
        ? null
        : input.correlationId;
    const allowlistedMetadata = validateMetadataForEvent(definition, input.metadata);
    const metadata = enforceRoleAdministrationAuditMetadata(
      input.eventType,
      input.metadata,
      allowlistedMetadata,
      actor.tenantId,
    );

    const fingerprint = buildIdempotencyFingerprint({
      actorUserId: actor.userId,
      eventType: input.eventType,
      outcome: input.outcome,
      resourceType,
      resourceId,
      occurredAt: input.occurredAt,
      correlationId,
      metadata,
    });

    const existing = await api.findEventByIdempotency(actor.tenantId, input.idempotencyKey);
    if (existing) {
      const existingMetadata =
        existing.metadata === null ? null : canonicalizeMetadata(existing.metadata);
      const existingFp = buildIdempotencyFingerprint({
        actorUserId: existing.actorUserId,
        eventType: existing.eventType,
        outcome: existing.outcome,
        resourceType: existing.resourceType,
        resourceId: existing.resourceId,
        occurredAt: existing.occurredAt,
        correlationId: existing.correlationId,
        metadata: existingMetadata,
      });
      if (!fingerprintsEqual(fingerprint, existingFp)) {
        throw new AuditError(
          AUDIT_IDEMPOTENCY_CONFLICT,
          'Idempotency key conflicts with an existing audit event.',
        );
      }
      return toView(existing);
    }

    let head = await api.findChainHead(actor.tenantId);
    if (!head) {
      try {
        head = await api.createInitialChainHead(actor.tenantId);
      } catch (error) {
        if (isPrismaKnownRequestError(error) && error.code === 'P2002') {
          head = await api.findChainHead(actor.tenantId);
          if (!head) {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }

    const expectedLastSequence = head.lastSequence;
    const sequence = expectedLastSequence + 1n;
    const prevHash = head.lastHash || INITIAL_PREV_HASH;
    const id = randomUUID();
    const recordedAt = new Date();

    const { payloadHash } = this.hashService.buildAndHashPayload({
      id,
      tenantId: actor.tenantId,
      sequence,
      idempotencyKey: input.idempotencyKey,
      actorUserId: actor.userId,
      eventType: input.eventType,
      outcome: input.outcome,
      resourceType,
      resourceId,
      occurredAt: input.occurredAt,
      recordedAt,
      correlationId,
      metadata,
    });
    const chainHash = this.hashService.hashChain(prevHash, payloadHash);

    const created = await api
      .createEvent({
        id,
        tenantId: actor.tenantId,
        sequence,
        idempotencyKey: input.idempotencyKey,
        actorUserId: actor.userId,
        eventType: input.eventType,
        outcome: input.outcome,
        resourceType,
        resourceId,
        occurredAt: input.occurredAt,
        recordedAt,
        correlationId,
        metadata: metadata as Prisma.InputJsonValue | null,
        prevHash,
        payloadHash,
        chainHash,
      })
      .catch((error: unknown) => {
        if (isPrismaKnownRequestError(error) && error.code === 'P2002') {
          throw new Prisma.PrismaClientKnownRequestError(
            'Audit event unique conflict under concurrent append',
            { code: 'P2034', clientVersion: '6.19.0' },
          );
        }
        throw error;
      });

    const advanced = await api.advanceChainHeadCas(
      actor.tenantId,
      expectedLastSequence,
      sequence,
      chainHash,
    );
    if (!advanced) {
      throw new Prisma.PrismaClientKnownRequestError('Audit chain head compare-and-swap conflict', {
        code: 'P2034',
        clientVersion: '6.19.0',
      });
    }
    return toView(created);
  }

  private assertActor(
    actor: AuthenticatedActor | null | undefined,
  ): asserts actor is AuthenticatedActor {
    if (
      !actor ||
      typeof actor.userId !== 'string' ||
      !actor.userId ||
      typeof actor.tenantId !== 'string' ||
      !actor.tenantId
    ) {
      throw new AuditError(AUDIT_ACTOR_REQUIRED, 'Authenticated actor is required.');
    }
  }

  private assertTenantAgreement(actor: AuthenticatedActor): void {
    const contextTenantId = this.tenantContext.getRequiredTenantId();
    if (contextTenantId !== actor.tenantId) {
      throw new AuditError(
        AUDIT_TENANT_CONTEXT_MISMATCH,
        'Tenant context does not match authenticated actor.',
      );
    }
  }

  private async withSerializableRetry<T>(operation: () => Promise<T>): Promise<T> {
    let attempt = 0;
    // initial + up to MAX_SERIALIZABLE_RETRIES
    const maxAttempts = 1 + MAX_SERIALIZABLE_RETRIES;
    while (attempt < maxAttempts) {
      try {
        return await operation();
      } catch (error) {
        if (
          isPrismaKnownRequestError(error) &&
          error.code === RETRYABLE_PRISMA_ERROR_CODE &&
          attempt + 1 < maxAttempts
        ) {
          attempt += 1;
          continue;
        }
        if (isPrismaKnownRequestError(error) && error.code === RETRYABLE_PRISMA_ERROR_CODE) {
          throw new AuditError(AUDIT_RETRY_EXHAUSTED, 'Serializable transaction retry exhausted.');
        }
        if (error instanceof AuditError) {
          throw error;
        }
        throw new AuditError(AUDIT_APPEND_FAILED, 'Audit append failed.');
      }
    }
    throw new AuditError(AUDIT_RETRY_EXHAUSTED, 'Serializable transaction retry exhausted.');
  }
}
