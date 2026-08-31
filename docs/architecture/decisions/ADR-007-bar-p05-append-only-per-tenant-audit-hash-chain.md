# ADR-007 — BAR-P05 append-only per-tenant audit hash chain

- Status: Proposed (implementation pending independent final review)
- Date: 2026-08-31
- Package: BAR-P05-AUDIT
- Authority: R0-7D-BAR-P05-OD1 (18/18), R0-7D-BAR-P05-AD2, R0-7D-BAR-P05-R1A1

## Context

CONFORA requires an append-only, tamper-evident audit ledger subordinate to
ISO/IEC 17024 / ISO/IEC 27001 auditability and multi-tenant isolation.
BAR-P03 authenticated actors and BAR-P04 tenant assurance are prerequisites.
No Nest audit ledger existed before BAR-P05.

## Decision

1. System of record: PostgreSQL via Prisma.
2. Models: `AuditEvent`, `AuditChainHead`; enum `AuditOutcome` =
   `SUCCESS | DENIED | FAILURE`.
3. Per-tenant SHA-256 hash chain; hashes are 64 lowercase hexadecimal characters.
4. Canonical payload version: `CONFORA_AUDIT_PAYLOAD_V1` with exact top-level
   field order:
   version, id, tenantId, sequence, idempotencyKey, actorUserId, eventType,
   outcome, resourceType, resourceId, occurredAt, recordedAt, correlationId,
   metadata.
5. Chain formula:
   `SHA256(UTF8("CONFORA_AUDIT_CHAIN_V1|" + prevHash + "|" + payloadHash))`.
6. First event: sequence `1`, prevHash =
   `0000000000000000000000000000000000000000000000000000000000000000`.
7. Append coordination uses SERIALIZABLE transactions; retry only Prisma
   `P2034` up to 3 retries after the initial attempt; exhaustion fails closed
   as `AUDIT_RETRY_EXHAUSTED`.
8. Idempotency: unique `(tenantId, idempotencyKey)`; exact replay returns the
   existing event without chain advancement; conflict fails closed.
9. Append-only: no `AuditEvent` update, delete, or upsert in production.
10. Integrity verification is read-only (`AuditIntegrityService`); no HTTP route.
11. Actor model: authenticated users only via `AuthenticatedActor`. Persist only
    `tenantId` and `actorUserId`. No system, platform, background, or anonymous
    actor.
12. Zero production audit HTTP routes. No audit read API.
13. `TenantPrismaService` remains read-only. Raw Prisma production allowlist
    grows exactly 6 → 7 with sole new path
    `apps/api/src/audit/audit.repository.ts`. No raw SQL.
14. `packages/audit-client` and `AuditActorContext` are not promoted.
15. No outbox, Kafka, or RabbitMQ.
16. No BAR-P06 / BAR-P07 / BAR-P08 domain integration in this package.
17. Production event registry initial count is zero.

## Consequences

- Semantic transaction coordinator: `AuditService`.
- Direct Prisma transaction executor: `AuditRepository` only.
- Fail-closed append; mandatory audit never silently drops.
- BAR-P05 is implemented pending independent final review; not accepted,
  not integrated, and not authorized for PR/merge/deployment by this ADR alone.
