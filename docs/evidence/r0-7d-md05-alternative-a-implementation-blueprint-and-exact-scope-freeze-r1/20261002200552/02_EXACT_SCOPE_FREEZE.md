# Exact scope freeze

```text
RECORD_UTC = 2026-10-02T20:05:52Z
MD05_ADDITIONAL_PATH_BOUNDARY_FROZEN = true
MD05_SCOPE_EXPANSION_ADOPTED = false
ADDITIONAL_PATH_COUNT = 0
```

## Frozen MD05 path row

| Field | Frozen value |
| --- | --- |
| MD_ID | MD05 |
| TITLE | api-grievances residual |
| PRIMARY_PATH | `frontend-app/src/lib/api-grievances.ts` |
| ADDITIONAL_PATHS | none |
| DEFINITION_STATUS | FROZEN_PROSPECTIVE (unchanged origin) |
| PATH_BOUNDARY_STATUS | FROZEN |
| SCOPE_EXPANSION | false |

## Explicitly outside the MD05 path freeze

- `apps/api/src/cert-appeals/` (named Alternative A ownership only)
- `apps/api/src/cert-complaints/` (named Alternative A ownership only)
- `frontend-app/src/lib/api/appeals-client.ts`
- `frontend-app/src/lib/api/appeals-types.ts`
- `frontend-app/src/lib/api/appeals-category.util.ts`
- `frontend-app/src/lib/staff-appeals-complaints-access.ts`
- Existing grievance UI pages/components (consumers remain; not MD05 ADDITIONAL_PATHS)
- Education cluster, identity-review, HD06, HD07, and the other seven unresolved Model D items
- Legacy `/v1/me/*` and `/v1/admin/*` appeal/complaint aliases
- Any copy from commit `a277a19`

## Exact in-scope residual (when later implementation is authorized)

Restore only `frontend-app/src/lib/api-grievances.ts` as a thin canonical
facade satisfying the frozen SoD and facade constraints. Any additional
path requires a later owner decision that expands this freeze or
authorizes a separate package.

## Eight-path freeze relationship

This package does not reopen or rewrite the eight-path definition freeze
R1 table for MD02/MD03/MD06/MD07/MD09/MD10/MD12. It only freezes the
previously PENDING MD05 additional-path boundary under Alternative A
without expanding ADDITIONAL_PATH_COUNT.
