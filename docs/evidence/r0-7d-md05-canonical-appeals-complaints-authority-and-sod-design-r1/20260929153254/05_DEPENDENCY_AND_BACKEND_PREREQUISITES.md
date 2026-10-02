# Dependency and backend prerequisites

DESIGN_UTC = 2026-09-29T15:32:54Z

## Freeze boundary, unchanged

MD05_PRIMARY_PATH = frontend-app/src/lib/api-grievances.ts
ADDITIONAL_PATH_COUNT = 0
FREEZE_EXPANSION_PERFORMED = false

The prior scope review found that the only known facade blob also
imports these missing files:

- frontend-app/src/lib/api/appeals-client.ts
- frontend-app/src/lib/api/appeals-types.ts
- frontend-app/src/lib/api/appeals-category.util.ts

This design does not add them to Part E. A later implementation cannot
proceed by copying them from `a277a19`, because that blob includes
legacy appeal aliases and the SoD defects named in the actor matrix.

The reported paths `frontend-app/src/lib/appeals-client.ts` and
`frontend-app/src/lib/appeals-types.ts` remain the wrong paths. They
are not the facade imports.

## What a later implementation would still need

These are prerequisites, not an authorization to create them:

1. Owner acceptance of this design after independent review.
2. A separate owner decision that either expands the MD05 additional-path
   set or defines a canonical appeals client under a new authorization.
3. An owner-named complaint-handler role. This design leaves that name unset.
4. A recorded privacy basis for the personal data in this residual.
5. Server modules for canonical appeals and complaints, with the SoD,
   tenant, and audit rules in this design, before the facade calls them.
6. Prisma or equivalent case storage. None was found on this base.
7. Tests that show original-decider refusal, tenant non-leak, 409
   behaviour, and the absence of legacy appeal calls. No such tests are
   added here.
8. Reconciliation of the Level 7 028D-2aS2 record that applied
   "No api-grievances" for that closure. This design does not delete
   that record and does not treat the freeze as implementation consent.

## Facade shape, if implementation is later authorized

The facade stays a thin canonical adapter:

- complaint calls do not select legacy complaint aliases
- appeal calls do not select legacy appeal aliases
- committee id is forwarded and is a server committee reference
- appellant subject id is not blanked
- decision start 409 is returned, not swallowed
- the facade does not write the audit trail

That shape is a constraint on future work. It is not code in this package.

MD05_RECOMMENDED_PRODUCTION_PATHS = none
MD05_RECOMMENDED_TEST_PATHS = none
MD05_SCOPE_READY = false
