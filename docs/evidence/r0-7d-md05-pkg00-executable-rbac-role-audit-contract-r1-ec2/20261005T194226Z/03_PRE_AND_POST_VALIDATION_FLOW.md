# 03 — Pre and post validation flow

## Located production objects

| Item                         | Location                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| Append entry point           | `AuditService.append` in `apps/api/src/audit/audit.service.ts`                            |
| Transaction boundary         | `executeInTransaction` then `AuditRepository.runSerializableTransaction`                  |
| Pre-persist function         | `appendWithin`                                                                            |
| Generic allowlist            | `validateMetadataForEvent` in `apps/api/src/audit/audit-validators.ts`                    |
| Semantic validator           | `validateRoleAdministrationAuditMetadata` in `apps/api/src/audit/audit-event.registry.ts` |
| Production registry          | `AuditEventRegistry.production()`                                                         |
| Persistence write            | `api.createEvent` inside `appendWithin`                                                   |
| Real append tests before EC2 | `apps/api/src/audit/audit.service.spec.ts` (custom `TEST_EVENT` registry)                 |
| EC2 append tests             | `apps/api/src/audit/md05-pkg00-production-append.spec.ts`                                 |

`audit-validators.ts` was not modified. Importing the registry from that file would cycle, because the registry already imports `validateMetadataForEvent`. The wiring therefore lives in `audit.service.ts`.

`packages/shared-types/src/role-administration.ts` was not modified. The EC1 validator already rejects null metadata, missing required keys, wrong roles, actor separation failures, and forbidden keys. It does not receive the authenticated actor tenant, and it treats `reviewDueAt` as a required non-empty string. The append path compares `metadata.tenantId` with `actor.tenantId` and calls the existing `isRevokePostReviewDuePeriod` for `ROLE_REVOKE_APPLIED`. Those checks stay before any persistence call.

## Flow before EC2

1. `append` checks the actor and tenant context, then opens a serializable transaction.
2. `appendWithin` parses the input, loads the registry definition, and applies the resource-type policy.
3. `validateMetadataForEvent` allowlists metadata. Null metadata becomes `null`.
4. The service fingerprints the event, calls `findEventByIdempotency`, reads or creates the chain head, then calls `createEvent` and `advanceChainHeadCas`.

PKG-00 events were not identified, and `validateRoleAdministrationAuditMetadata` was not called.

## Flow after EC2

1. Steps 1 and 2 are unchanged.
2. `validateMetadataForEvent` still runs first for every event, including the ten PKG-00 events.
3. `enforceRoleAdministrationAuditMetadata` then runs:
   - events outside the ten codes return the allowlisted value unchanged;
   - each of the ten codes calls `validateRoleAdministrationAuditMetadata` with the event code and the original metadata;
   - `metadata.tenantId` must equal `actor.tenantId`;
   - `ROLE_REVOKE_APPLIED` must satisfy `isRevokePostReviewDuePeriod(occurredAt, reviewDueAt)`.
4. Only after that function returns does the service build the fingerprint or call `findEventByIdempotency`, `findChainHead`, `createInitialChainHead`, `createEvent`, or `advanceChainHeadCas`.

`AuditError` continues to propagate from `withSerializableRetry`. Validation messages name the failing rule. They do not echo the rejected metadata object, tenant identifiers, or secret values.

```text
GENERIC_ALLOWLIST_VALIDATION = REQUIRED
ROLE_ADMINISTRATION_SEMANTIC_VALIDATION = REQUIRED
```
