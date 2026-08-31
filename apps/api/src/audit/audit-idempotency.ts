import type { AuditOutcomeLiteral } from './audit-event.types';

export type IdempotencyFingerprint = {
  actorUserId: string;
  eventType: string;
  outcome: AuditOutcomeLiteral;
  resourceType: string | null;
  resourceId: string | null;
  occurredAtIso: string;
  correlationId: string | null;
  metadataCanonicalJson: string | null;
};

export function buildIdempotencyFingerprint(parts: {
  actorUserId: string;
  eventType: string;
  outcome: AuditOutcomeLiteral;
  resourceType: string | null;
  resourceId: string | null;
  occurredAt: Date;
  correlationId: string | null;
  metadata: unknown;
}): IdempotencyFingerprint {
  return {
    actorUserId: parts.actorUserId,
    eventType: parts.eventType,
    outcome: parts.outcome,
    resourceType: parts.resourceType,
    resourceId: parts.resourceId,
    occurredAtIso: parts.occurredAt.toISOString(),
    correlationId: parts.correlationId,
    metadataCanonicalJson:
      parts.metadata === null || parts.metadata === undefined
        ? null
        : JSON.stringify(parts.metadata),
  };
}

export function fingerprintsEqual(a: IdempotencyFingerprint, b: IdempotencyFingerprint): boolean {
  return (
    a.actorUserId === b.actorUserId &&
    a.eventType === b.eventType &&
    a.outcome === b.outcome &&
    a.resourceType === b.resourceType &&
    a.resourceId === b.resourceId &&
    a.occurredAtIso === b.occurredAtIso &&
    a.correlationId === b.correlationId &&
    a.metadataCanonicalJson === b.metadataCanonicalJson
  );
}
