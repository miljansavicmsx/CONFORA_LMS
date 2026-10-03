# 06 — Scope and non-claims

## Authorized paths

Governance updates:

1. docs/governance/OWNER_DECISION_REGISTER.md
2. docs/governance/OWNER_DECISION_PACKAGE.md
3. docs/governance/R0_7D_MD05_PHASE0_PREREQUISITE_AUTHORITY_FREEZE_R2.md

New evidence directory:

docs/evidence/r0-7d-md05-phase0-prerequisite-authority-freeze-r2/20261003062710/

Files in that directory:

1. 00_SUMMARY.md
2. 01_AUTHORITY_AND_LINEAGE.md
3. 02_ROLE_MODEL.md
4. 03_GRANT_REVOKE_MATRIX.md
5. 04_SOD_AND_TENANT_CONTROLS.md
6. 05_IMPLEMENTATION_PREREQUISITES.md
7. 06_SCOPE_AND_NONCLAIMS.md
8. 07_VALIDATION.md
9. 08_SHA256_MANIFEST.md

No other path is authorized.

## Prohibited mutations

- packages/shared-types/src/roles.ts
- any production source
- tests
- Prisma schema
- migrations
- configuration
- infrastructure
- dependencies
- lockfiles
- existing historical evidence

## Non-claims

PRIMARY_PATH = frontend-app/src/lib/api-grievances.ts

ADDITIONAL_PATHS = none

MD05_FORMALLY_RESOLVED = false

MD05_SCOPE_READY = false

MD05_IMPLEMENTATION_AUTHORIZATION = false

MODEL_D = 17/9/8/8/0

MODEL_D_MUTATION_COUNT = 0

GENERAL_C3_S9_IMPLEMENTATION_RESUME_AUTHORIZATION = NOT_GRANTED

R0_7E_IMPLEMENTATION_AUTHORIZATION = false

DEPLOYMENT_AUTHORIZATION = false

CI_GREEN_CLAIMED = false

CI_FAILURE_WAIVER_GRANTED = false

PR_CREATED = false

MERGE_PERFORMED = false

ROLE_GRANT_REVOKE_IMPLEMENTED = false

COMPLAINT_HANDLER_ROLE_IMPLEMENTED = false

ROLE_ADMINISTRATOR_ROLE_IMPLEMENTED = false

LOCAL_DATABASE_ROLE_AUTHORITY = false

This package does not claim a Keycloak Admin client, a fixed post-review
duration, an executing four-eyes control, or an executing post-review control.

R1 commit 7f6e2ba05f0abe569111a90594689519fec96304 is not authoritative and is
not rewritten by this package.

Next action, not granted:

OWNER_AUTHORIZE_INDEPENDENT_CURSOR_R0_7D_MD05_PHASE0_PREREQUISITE_AUTHORITY_FREEZE_R2_REVIEW
