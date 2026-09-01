import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';

import {
  buildCanonicalAuditPayloadV1,
  serializeCanonicalPayloadV1,
  type CanonicalAuditPayloadV1,
} from './audit-canonicalizer';
import type { AuditOutcomeLiteral } from './audit-event.types';

@Injectable()
export class AuditHashService {
  hashPayload(payload: CanonicalAuditPayloadV1): string {
    const utf8 = serializeCanonicalPayloadV1(payload);
    return createHash('sha256').update(utf8, 'utf8').digest('hex');
  }

  hashChain(prevHash: string, payloadHash: string): string {
    const input = `CONFORA_AUDIT_CHAIN_V1|${prevHash}|${payloadHash}`;
    return createHash('sha256').update(input, 'utf8').digest('hex');
  }

  buildAndHashPayload(parts: {
    id: string;
    tenantId: string;
    sequence: bigint;
    idempotencyKey: string;
    actorUserId: string;
    eventType: string;
    outcome: AuditOutcomeLiteral;
    resourceType: string | null;
    resourceId: string | null;
    occurredAt: Date;
    recordedAt: Date;
    correlationId: string | null;
    metadata: unknown;
  }): { payload: CanonicalAuditPayloadV1; payloadHash: string; chainInput: string } {
    const payload = buildCanonicalAuditPayloadV1(parts);
    const payloadHash = this.hashPayload(payload);
    return { payload, payloadHash, chainInput: serializeCanonicalPayloadV1(payload) };
  }
}
