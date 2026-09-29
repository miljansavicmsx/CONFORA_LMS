# R0-7D MD05 canonical architecture alternative A — decision freeze R2

Source: Repository Owner messages dated 2026-09-29.

Selection:

`OWNER_SELECT_R0_7D_MD05_CANONICAL_ARCHITECTURE_ALTERNATIVE_A`

Clean reissuance authorization, single-use, consumed by this candidate record:

`OWNER_AUTHORIZE_R0_7D_MD05_CANONICAL_ARCHITECTURE_ALTERNATIVE_A_DECISION_FREEZE_R2_CLEAN_REISSUANCE`

This file records the adopted architecture. It is a clean reissuance candidate.
It is not integration authority until independent review and a later
owner-authorized pull request and merge. This package does not open a
pull request and does not merge.

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

Clean reissuance constraints supplied with the R2 authorization:

```text
BASE_HEAD =
9623a2f45612e5aa843ac73b87cd34957dac48ab

HISTORICAL_R1_COMMIT =
6e3a3118164a48e143e607a6eb5846c2b82c2a8c

HISTORICAL_R1_PR = 42
HISTORICAL_R1_STATUS =
PRESERVED_UNMERGED_NONAUTHORITATIVE_ATTEMPT

PR_42_MERGE_AUTHORIZATION = false
PR_42_MODIFICATION_AUTHORIZATION = false
PR_42_DELETION_AUTHORIZATION = false
```

The adopted architecture is separate canonical modules for appeals and
complaints. Legacy `/v1` aliases are not canonical. Commit `a277a19` is
not implementation authority. Pull request #41 remains a historical design
note and is not to be merged.

Pull request #42 and commit `6e3a3118` remain a preserved, unmerged,
non-authoritative attempt. This reissuance does not modify, merge, or
delete that pull request, and it does not use that commit as a parent.

The additional-path boundary and the detailed RBAC and segregation-of-duties
matrix remain pending a later governance freeze. MD05 stays unresolved.
Implementation stays unauthorized. Model D stays `17/9/8/8/0`.
