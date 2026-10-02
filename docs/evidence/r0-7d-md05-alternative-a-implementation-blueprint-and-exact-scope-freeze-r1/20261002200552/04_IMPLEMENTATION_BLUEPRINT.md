# Implementation blueprint (recorded; not authorized)

```text
RECORD_UTC = 2026-10-02T20:05:52Z
IMPLEMENTATION_BLUEPRINT_RECORDED = true
MD05_IMPLEMENTATION_AUTHORIZATION = false
MD05_SCOPE_READY = false
```

## Blueprint purpose

Define the constrained future residual shape for MD05 under Alternative A
after exact scope and SoD are frozen. This is not code and not an
implementation grant.

## Phase gate 0 — external prerequisites (outside MD05 path freeze)

Each item requires a later owner-authorized package:

1. Create and wire `apps/api/src/cert-appeals/` and
   `apps/api/src/cert-complaints/` with tenant isolation, immutable audit
   events, and the frozen SoD checks.
2. Persist case storage (Prisma or equivalent) for appeals and complaints.
3. Owner-name the complaint-handler role (`COMPLAINT_HANDLER_ROLE` is
   frozen as NOT_NAMED until then).
4. Record a GDPR privacy basis for residual personal data.
5. Decide whether missing appeals client helpers remain separate packages
   or whether a later decision expands MD05 ADDITIONAL_PATHS.

## Phase gate 1 — MD05 residual (PRIMARY_PATH only)

When separately authorized, restore only:

`frontend-app/src/lib/api-grievances.ts`

Facade constraints:

- canonical routes only; no legacy `/v1/me/*` or `/v1/admin/*` aliases
- never blank authenticated subject ids
- forward a real server committee reference; do not send role labels as
  committee ids
- surface decision-start HTTP 409; do not swallow and continue
- do not write the audit trail
- do not mutate certificate status, exam results, or certification
  decision records
- do not call legacy complaint aliases even if
  `VITE_COMPLAINTS_CANONICAL_ENABLED` is false

## Phase gate 2 — verification (later authorized package)

Required negative and boundary proofs before MD05 can be proposed as
formally resolved:

- original-decider refusal on appeal mutations
- tenant non-leak on list/read
- 409 on duplicate decision start
- no legacy appeal alias calls from the facade
- complaint handler refusal while role remains unnamed or unauthorized

## Explicit non-sequence

- Do not start Phase 1 before Phase 0 prerequisites exist or are
  separately waived by owner decision.
- Do not treat this blueprint as general C3-S9 resume.
- Do not merge PR 41 or copy `a277a19`.
- Do not resolve MD05 in Model D arithmetic from this package alone.
