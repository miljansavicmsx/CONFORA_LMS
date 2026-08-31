import { Injectable } from '@nestjs/common';

import { AuditError, AUDIT_CHAIN_INTEGRITY_FAILED } from './audit-errors';
import { INITIAL_PREV_HASH } from './audit-event.types';
import { AuditHashService } from './audit-hash.service';
import { AuditRepository } from './audit.repository';
import { buildCanonicalAuditPayloadV1 } from './audit-canonicalizer';

export type IntegrityResult =
  | { status: 'PASS_EMPTY_CHAIN' }
  | { status: 'PASS'; chainLength: number };

const HEX64 = /^[0-9a-f]{64}$/;

@Injectable()
export class AuditIntegrityService {
  constructor(
    private readonly repository: AuditRepository,
    private readonly hashService: AuditHashService,
  ) {}

  /**
   * Read-only verification of one tenant chain. No mutation. No HTTP route.
   */
  async verifyTenantChain(tenantId: string): Promise<IntegrityResult> {
    const events = await this.repository.findEventsForTenantOrdered(tenantId);
    const head = await this.repository.findChainHead(tenantId);

    if (events.length === 0 && head === null) {
      return { status: 'PASS_EMPTY_CHAIN' };
    }
    if (events.length === 0 && head !== null) {
      throw new AuditError(AUDIT_CHAIN_INTEGRITY_FAILED, 'Chain head exists without events.');
    }
    if (events.length > 0 && head === null) {
      throw new AuditError(AUDIT_CHAIN_INTEGRITY_FAILED, 'Events exist without chain head.');
    }
    if (head === null) {
      throw new AuditError(AUDIT_CHAIN_INTEGRITY_FAILED, 'Events exist without chain head.');
    }

    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      if (event === undefined) {
        throw new AuditError(AUDIT_CHAIN_INTEGRITY_FAILED, 'Sequence continuity failed.');
      }
      if (event.tenantId !== tenantId) {
        throw new AuditError(AUDIT_CHAIN_INTEGRITY_FAILED, 'Cross-tenant contamination detected.');
      }
      const expectedSequence = BigInt(i + 1);
      if (event.sequence !== expectedSequence) {
        throw new AuditError(AUDIT_CHAIN_INTEGRITY_FAILED, 'Sequence continuity failed.');
      }
      if (
        !HEX64.test(event.prevHash) ||
        !HEX64.test(event.payloadHash) ||
        !HEX64.test(event.chainHash)
      ) {
        throw new AuditError(AUDIT_CHAIN_INTEGRITY_FAILED, 'Hash format invalid.');
      }

      let expectedPrev: string;
      if (i === 0) {
        expectedPrev = INITIAL_PREV_HASH;
      } else {
        const previous = events[i - 1];
        if (previous === undefined) {
          throw new AuditError(AUDIT_CHAIN_INTEGRITY_FAILED, 'Sequence continuity failed.');
        }
        expectedPrev = previous.chainHash;
      }
      if (event.prevHash !== expectedPrev) {
        throw new AuditError(AUDIT_CHAIN_INTEGRITY_FAILED, 'prevHash mismatch.');
      }

      const payload = buildCanonicalAuditPayloadV1({
        id: event.id,
        tenantId: event.tenantId,
        sequence: event.sequence,
        idempotencyKey: event.idempotencyKey,
        actorUserId: event.actorUserId,
        eventType: event.eventType,
        outcome: event.outcome,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        occurredAt: event.occurredAt,
        recordedAt: event.recordedAt,
        correlationId: event.correlationId,
        metadata: event.metadata,
      });
      const payloadHash = this.hashService.hashPayload(payload);
      if (payloadHash !== event.payloadHash) {
        throw new AuditError(AUDIT_CHAIN_INTEGRITY_FAILED, 'payloadHash mismatch.');
      }
      const chainHash = this.hashService.hashChain(event.prevHash, event.payloadHash);
      if (chainHash !== event.chainHash) {
        throw new AuditError(AUDIT_CHAIN_INTEGRITY_FAILED, 'chainHash mismatch.');
      }
    }

    const last = events[events.length - 1];
    if (last === undefined) {
      throw new AuditError(AUDIT_CHAIN_INTEGRITY_FAILED, 'Chain head mismatch.');
    }
    if (head.lastSequence !== last.sequence || head.lastHash !== last.chainHash) {
      throw new AuditError(AUDIT_CHAIN_INTEGRITY_FAILED, 'Chain head mismatch.');
    }

    return { status: 'PASS', chainLength: events.length };
  }
}
