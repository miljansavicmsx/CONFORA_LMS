import { createHash } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import {
  ROLE_GRANT_AUTHORITY,
  TARGET_ROLE,
  roleAdministrationContractSchema,
  type RoleAdministrationContract,
} from '@confora/shared-types';

import { AuditService } from '../audit/audit.service';
import type { RoleAdministrationAuditEventType } from '../audit/audit-event.registry';
import type { AuditOutcomeLiteral } from '../audit/audit-event.types';
import type { AuthenticatedActor } from '../auth/request-principal';
import {
  CLIENT_APPLIED_DECISION_FORBIDDEN,
  isClientAppliedDecision,
} from './dto/role-administration-command.dto';
import { ExternalIdpRoleManagementPort } from './external-idp-role-management.port';
import { RoleAdministrationBoundaryService } from './role-administration-boundary.service';

export type RoleAdministrationWorkflowResult = {
  readonly recorded: boolean;
  readonly roleApplied: false;
  readonly externalEffect: 'NONE' | 'UNBOUND_NO_APPLY';
  readonly reviewObligationCreated: false;
  readonly auditEvents: readonly string[];
  readonly codes: readonly string[];
};

function closed(
  codes: readonly string[],
  recorded = false,
  externalEffect: RoleAdministrationWorkflowResult['externalEffect'] = 'NONE',
  auditEvents: readonly string[] = [],
): RoleAdministrationWorkflowResult {
  return Object.freeze({
    recorded,
    roleApplied: false,
    externalEffect,
    reviewObligationCreated: false,
    auditEvents: Object.freeze([...auditEvents]),
    codes: Object.freeze([...codes]),
  });
}

function eventIdempotencyKey(requestId: string, eventType: string): string {
  const hash = createHash('sha256')
    .update(`confora-pkg03:${requestId}:${eventType}`)
    .digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  const version = bytes[6];
  const variant = bytes[8];
  if (version === undefined || variant === undefined) {
    throw new Error('PKG-03 idempotency key derivation failed.');
  }
  bytes[6] = (version & 0x0f) | 0x40;
  bytes[8] = (variant & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function outcomeFor(eventType: RoleAdministrationAuditEventType): AuditOutcomeLiteral {
  if (eventType.endsWith('_FAILED')) {
    return 'FAILURE';
  }
  if (eventType.endsWith('_REJECTED')) {
    return 'DENIED';
  }
  return 'SUCCESS';
}

/**
 * PKG-03 workflow.
 * PKG-01 runs before any audit append or PKG-02 call.
 * The unbound port cannot apply a role, so this slice never appends an
 * applied-event and never creates a post-review obligation.
 */
@Injectable()
export class RoleAdministrationWorkflowService {
  constructor(
    private readonly boundary: RoleAdministrationBoundaryService,
    private readonly port: ExternalIdpRoleManagementPort,
    private readonly audit: AuditService,
  ) {}

  async execute(
    actor: AuthenticatedActor | null | undefined,
    command: unknown,
  ): Promise<RoleAdministrationWorkflowResult> {
    if (isClientAppliedDecision(command)) {
      return closed([CLIENT_APPLIED_DECISION_FORBIDDEN]);
    }

    const boundaryResult = this.boundary.evaluate(actor, command);
    if (!boundaryResult.accepted || actor == null) {
      return closed(boundaryResult.accepted ? ['ACTOR_NOT_AUTHENTICATED'] : boundaryResult.codes);
    }

    const parsed = roleAdministrationContractSchema.safeParse(command);
    if (!parsed.success) {
      return closed(['COMMAND_SCHEMA_REJECTED']);
    }

    return this.dispatch(actor, command, parsed.data);
  }

  private async dispatch(
    actor: AuthenticatedActor,
    command: unknown,
    contract: RoleAdministrationContract,
  ): Promise<RoleAdministrationWorkflowResult> {
    if (contract.operation === 'REVOKE' && contract.decision === 'REVIEWED') {
      return closed(['REVOKE_REVIEW_REQUIRES_APPLIED_REVOKE']);
    }

    if (contract.operation === 'GRANT' && contract.decision === 'REQUESTED') {
      await this.appendEvent(actor, contract, 'ROLE_GRANT_REQUESTED', contract.requestedAt, {});
      return closed([], true, 'NONE', ['ROLE_GRANT_REQUESTED']);
    }

    if (contract.operation === 'GRANT' && contract.decision === 'REJECTED') {
      const occurredAt = contract.decidedAt ?? contract.requestedAt;
      await this.appendEvent(actor, contract, 'ROLE_GRANT_REJECTED', occurredAt, {
        initiatorUserId: contract.initiatorUserId,
        initiatorExternalSubjectId: contract.initiatorExternalSubjectId,
        initiatorRole: contract.initiatorRole,
        approverUserId: contract.approverUserId ?? '',
        approverExternalSubjectId: contract.approverExternalSubjectId ?? '',
        approverRole: contract.approverRole ?? '',
      });
      return closed([], true, 'NONE', ['ROLE_GRANT_REJECTED']);
    }

    if (contract.decision === 'APPLIED') {
      return closed([CLIENT_APPLIED_DECISION_FORBIDDEN]);
    }

    if (contract.operation === 'GRANT' && contract.decision === 'APPROVED') {
      return this.failClosedApply(actor, command, contract, 'GRANT');
    }

    if (contract.operation === 'REVOKE' && contract.decision === 'REJECTED') {
      await this.appendEvent(actor, contract, 'ROLE_REVOKE_REJECTED', contract.requestedAt, {});
      return closed([], true, 'NONE', ['ROLE_REVOKE_REJECTED']);
    }

    if (contract.operation === 'REVOKE' && contract.decision === 'REQUESTED') {
      return this.failClosedApply(actor, command, contract, 'REVOKE');
    }

    return closed(['WORKFLOW_DECISION_NOT_EXECUTABLE']);
  }

  private async failClosedApply(
    actor: AuthenticatedActor,
    command: unknown,
    contract: RoleAdministrationContract,
    operation: 'GRANT' | 'REVOKE',
  ): Promise<RoleAdministrationWorkflowResult> {
    if (contract.decision === 'APPLIED') {
      return closed([CLIENT_APPLIED_DECISION_FORBIDDEN]);
    }

    const occurredAt =
      operation === 'GRANT' ? (contract.decidedAt ?? contract.requestedAt) : contract.requestedAt;
    const events: string[] = [];

    if (operation === 'GRANT' && contract.decision === 'APPROVED') {
      await this.appendEvent(actor, contract, 'ROLE_GRANT_APPROVED', occurredAt, {
        initiatorUserId: contract.initiatorUserId,
        initiatorExternalSubjectId: contract.initiatorExternalSubjectId,
        initiatorRole: contract.initiatorRole,
        approverUserId: contract.approverUserId ?? '',
        approverExternalSubjectId: contract.approverExternalSubjectId ?? '',
        approverRole: contract.approverRole ?? '',
      });
      events.push('ROLE_GRANT_APPROVED');
    }

    if (operation === 'REVOKE' && contract.decision === 'REQUESTED') {
      await this.appendEvent(actor, contract, 'ROLE_REVOKE_REQUESTED', occurredAt, {});
      events.push('ROLE_REVOKE_REQUESTED');
    }

    const portResult = this.port.requestRoleChange(actor, command);
    if (!portResult.codes.includes('PROVIDER_UNBOUND')) {
      throw new Error('PKG-03 refuses a role result that is not an unbound non-application.');
    }
    const failureEvent: RoleAdministrationAuditEventType =
      operation === 'GRANT' ? 'ROLE_GRANT_FAILED' : 'ROLE_REVOKE_FAILED';
    await this.appendEvent(actor, contract, failureEvent, occurredAt, {
      decision: 'FAILED',
      previousState: contract.previousState,
      resultingState: contract.previousState,
      errorCode: 'PROVIDER_UNBOUND',
    });
    events.push(failureEvent);
    return closed(['PROVIDER_UNBOUND'], true, 'UNBOUND_NO_APPLY', events);
  }

  private async appendEvent(
    actor: AuthenticatedActor,
    contract: RoleAdministrationContract,
    eventType: RoleAdministrationAuditEventType,
    occurredAt: string,
    extras: Readonly<Record<string, string>>,
  ): Promise<void> {
    const eventId = eventIdempotencyKey(contract.requestId, eventType);
    const metadata: Record<string, string> = {
      eventId,
      occurredAt,
      tenantId: actor.tenantId,
      actorUserId: actor.userId,
      actorExternalSubjectId: actor.subject,
      actorRole: ROLE_GRANT_AUTHORITY,
      targetUserId: contract.targetUserId,
      targetExternalSubjectId: contract.targetExternalSubjectId,
      role: TARGET_ROLE,
      requestId: contract.requestId,
      reasonCode: contract.reasonCode,
      correlationId: contract.correlationId,
      sourceSystem: contract.sourceSystem,
      decision: extras['decision'] ?? contract.decision,
      previousState: extras['previousState'] ?? contract.previousState,
      resultingState: extras['resultingState'] ?? contract.resultingState,
    };
    for (const [key, value] of Object.entries(extras)) {
      if (key === 'decision' || key === 'previousState' || key === 'resultingState') {
        continue;
      }
      metadata[key] = value;
    }

    await this.audit.append(actor, {
      idempotencyKey: eventId,
      eventType,
      outcome: outcomeFor(eventType),
      occurredAt: new Date(occurredAt),
      correlationId: contract.correlationId,
      metadata,
    });
  }
}
