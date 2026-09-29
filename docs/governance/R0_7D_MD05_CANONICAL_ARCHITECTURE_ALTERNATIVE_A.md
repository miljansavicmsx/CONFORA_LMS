# R0-7D MD05 canonical architecture alternative A

Source: Repository Owner message in this task dated 2026-09-29:

`OWNER_SELECT_R0_7D_MD05_CANONICAL_ARCHITECTURE_ALTERNATIVE_A`

This record is Level 1 once entered in the Owner Decision Register. It
selects an architecture. It does not expand the MD05 path freeze, does
not implement appeals or complaints, and does not change Model D.

```text
OWNER_DECISION_STATUS = ADOPTED
SELECTED_ALTERNATIVE = A
DESIGN_PACKAGE_SHA256 =
fcc012bf7ff6b2c86fe0b3fd6d41ec6cf3ff733de227c18a26c350fa4f9afad2

MD05_CANONICAL_ARCHITECTURE =
SEPARATE_CANONICAL_APPEALS_AND_COMPLAINTS_MODULES

CANONICAL_BACKEND_OWNERSHIP =
apps/api/src/cert-appeals/
apps/api/src/cert-complaints/

MD05_REMAINS_SINGLE_MODEL_D_ITEM = true
MD05_ADDITIONAL_PATH_BOUNDARY_STATUS = PENDING_GOVERNANCE_FREEZE
MD05_SCOPE_EXPANSION_ADOPTED = false
MD05_IMPLEMENTATION_AUTHORIZATION = false

LEGACY_V1_ALIAS_ROUTING_CANONICAL = false
HISTORICAL_COMMIT_A277A19_IMPLEMENTATION_AUTHORITY = false

APPEAL_RESOLUTION_COMMITTEE_ID_REQUIRED = true
AUTHENTICATED_CASE_EMPTY_USER_ID_ALLOWED = false
IMMUTABLE_CASE_AUDIT_EVENTS_REQUIRED = true
TENANT_ISOLATION_REQUIRED = true

ORIGINAL_CERTIFICATION_DECISION_MAKER_MAY_APPROVE_APPEAL = false
ADMINISTRATOR_CASE_DECISION_ROLE = false
AUDITOR_CASE_MUTATION_ROLE = false
DETAILED_RBAC_SOD_MATRIX_STATUS = PENDING_GOVERNANCE_FREEZE

MODEL_D = 17/9/8/8/0
MODEL_D_MUTATION_COUNT = 0
MD05_STATUS = UNRESOLVED_ARCHITECTURE_SELECTED_PENDING_SCOPE_FREEZE

GENERAL_C3_S9_IMPLEMENTATION_RESUME_AUTHORIZATION = NOT_GRANTED
R0_7E_IMPLEMENTATION_AUTHORIZATION = false
DEPLOYMENT_AUTHORIZATION = false
CI_GREEN_CLAIMED = false
CI_FAILURE_WAIVER_GRANTED = false

PR_41_STATUS =
HISTORICAL_NONAUTHORITATIVE_DESIGN_NOTE_NOT_TO_BE_MERGED
```

The adopted architecture is separate canonical modules for appeals and
complaints. Legacy `/v1` aliases are not canonical. Commit `a277a19` is
not implementation authority. Pull request #41 is a historical design
note and is not to be merged.

The additional-path boundary and the detailed RBAC and segregation-of-duties
matrix remain pending a later governance freeze. Until that freeze,
MD05 stays unresolved and implementation stays unauthorized.
