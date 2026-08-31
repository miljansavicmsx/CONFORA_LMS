import { AuditError, AUDIT_METADATA_INVALID } from './audit-errors';
import { CANONICAL_PAYLOAD_VERSION, type AuditOutcomeLiteral } from './audit-event.types';

/**
 * Canonicalize metadata: recursively sort object keys, preserve array order,
 * preserve null, reject undefined/NaN/Infinity/bigint/function/symbol/cycles.
 * Does not mutate caller input.
 */
export function canonicalizeMetadata(value: unknown, seen = new WeakSet()): unknown {
  if (value === null) return null;
  if (value === undefined) {
    throw new AuditError(AUDIT_METADATA_INVALID, 'Metadata must not contain undefined.');
  }
  if (typeof value === 'symbol' || typeof value === 'function') {
    throw new AuditError(AUDIT_METADATA_INVALID, 'Metadata contains forbidden type.');
  }
  if (typeof value === 'bigint') {
    throw new AuditError(AUDIT_METADATA_INVALID, 'Metadata must not contain bigint.');
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new AuditError(AUDIT_METADATA_INVALID, 'Metadata must not contain non-finite numbers.');
    }
    return value;
  }
  if (typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) {
    if (seen.has(value)) {
      throw new AuditError(AUDIT_METADATA_INVALID, 'Metadata must not contain cycles.');
    }
    seen.add(value);
    return value.map((item) => canonicalizeMetadata(item, seen));
  }
  if (typeof value === 'object') {
    if (seen.has(value)) {
      throw new AuditError(AUDIT_METADATA_INVALID, 'Metadata must not contain cycles.');
    }
    seen.add(value);
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      out[key] = canonicalizeMetadata(obj[key], seen);
    }
    return out;
  }
  throw new AuditError(AUDIT_METADATA_INVALID, 'Metadata contains unsupported type.');
}

export type CanonicalAuditPayloadV1 = {
  version: typeof CANONICAL_PAYLOAD_VERSION;
  id: string;
  tenantId: string;
  sequence: string;
  idempotencyKey: string;
  actorUserId: string;
  eventType: string;
  outcome: AuditOutcomeLiteral;
  resourceType: string | null;
  resourceId: string | null;
  occurredAt: string;
  recordedAt: string;
  correlationId: string | null;
  metadata: unknown;
};

export function buildCanonicalAuditPayloadV1(parts: {
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
}): CanonicalAuditPayloadV1 {
  // Exact top-level field insertion order for JSON.stringify stability.
  const payload: CanonicalAuditPayloadV1 = {
    version: CANONICAL_PAYLOAD_VERSION,
    id: parts.id,
    tenantId: parts.tenantId,
    sequence: parts.sequence.toString(10),
    idempotencyKey: parts.idempotencyKey,
    actorUserId: parts.actorUserId,
    eventType: parts.eventType,
    outcome: parts.outcome,
    resourceType: parts.resourceType,
    resourceId: parts.resourceId,
    occurredAt: parts.occurredAt.toISOString(),
    recordedAt: parts.recordedAt.toISOString(),
    correlationId: parts.correlationId,
    metadata: parts.metadata === undefined ? null : parts.metadata,
  };
  return payload;
}

export function serializeCanonicalPayloadV1(payload: CanonicalAuditPayloadV1): string {
  // JSON.stringify preserves insertion order of own string keys.
  return JSON.stringify(payload);
}
