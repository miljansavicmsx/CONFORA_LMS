# R0-7D MD05 PKG-03 policy and exact scope freeze R1

Authorization:

`OWNER_SELECT_R0_7D_MD05_PKG03_POLICY_OPTIONS_A1_B1_C1R_D1_AND_AUTHORIZE_SCOPE_FREEZE_AND_IMPLEMENTATION_R1`

```text
OWNER_POLICY_SELECTION_STATUS = ADOPTED
OWNER_SELECTED_OPTIONS = A1, B1, C1R, D1
PKG03_TITLE = Role grant and revoke workflow with immutable audit
STATUS_BEFORE = BLOCKED_POLICY
STATUS_AFTER_POLICY_FREEZE = READY_FOR_IMPLEMENTATION
IMPLEMENTATION_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

This record freezes the owner decisions for PKG-03. It does not resolve MD05,
does not change Model D, and does not authorize deployment, a pull request, or
a merge.

## Base

```text
BASE_BRANCH = fix/ca-h01-frontend-f4-cutover
BASE_HEAD = 7d5ccc62dde4bdc4e10e0a8f2ab5dad055a5b68a
BASE_TREE = 1d04ba0a89b8d83d9e8bb3604115e5b5373845b5
BASE_PARENT_1 = 3b248ba394b36da47249a77aabfa1df997388815
BASE_PARENT_2 = b1553cc58a0e7828ef2e292288c0c763da10bc3d
PKG01_STATUS = INTEGRATED_ACCEPTED
PKG02_STATUS = INTEGRATED_ACCEPTED
MODEL_D = 17/9/8/8/0
MD05_FORMALLY_RESOLVED = false
MD05_SCOPE_READY = false
```

## A1 — post-review period

```text
POST_REVIEW_DUE_PERIOD = PT24H
POST_REVIEW_DUE_PERIOD_MEANING = 24 elapsed hours
```

`PT24H` is the integrated PKG-00 contract value. This selection confirms it.
It does not reopen the period.

## Roles, separation of duties, and tenant boundary

```text
MANAGED_ROLE = COMPLAINT_HANDLER
GRANT_AUTHORITY = STAFF_ROLEADM
REVOKE_AUTHORITY = STAFF_ROLEADM
GRANT_FOUR_EYES_REQUIRED = true
GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER = true
GRANT_INITIATOR_ROLE = STAFF_ROLEADM
GRANT_APPROVER_ROLE = STAFF_ROLEADM
REVOKE_FOUR_EYES_REQUIRED = false
REVOKE_POST_REVIEW_REQUIRED = true
REVOKE_REVIEWER_ROLE = STAFF_ROLEADM
REVOKE_REVIEWER_MUST_DIFFER_FROM_REVOKE_ACTOR = true
TENANT_BOUNDARY = authenticated actor tenant equals command tenant and target-user tenant
CROSS_TENANT_OPERATION_ALLOWED = false
SELF_ASSIGNMENT_ALLOWED = false
SELF_REVOCATION_ALLOWED = false
COMPLAINT_CASE_MUTATION_AUTHORITY_GRANTED_TO_STAFF_ROLEADM = false
COMPLAINT_DECISION_AUTHORITY_GRANTED_TO_STAFF_ROLEADM = false
APPEAL_DECISION_AUTHORITY_GRANTED_TO_STAFF_ROLEADM = false
```

## B1 and C1R — privacy and retention

```text
PERSISTENCE_MODEL = EXISTING_AUDIT_EVENT_APPEND_ONLY
NEW_WORKFLOW_STORE = false
NEW_DATABASE_TABLE = false
NEW_LOCAL_ROLE_COLUMN = false
NO_NEW_WORKFLOW_DATA_STORE = true
PROCESSING_LIMITED_TO_EXISTING_AUDIT_LEDGER = true
PROCESSING_PURPOSE = security and access-control administration, segregation-of-duties evidence, accountability, and traceability of role grant and revoke decisions
PRIVACY_BASIS_TECHNICAL_RECORD = security and access-control accountability under the controller's approved privacy and information-security governance
STATUTORY_ARTICLE_CITATION_FIXED_BY_THIS_PACKAGE = false
DPO_OR_CONTROLLER_LEGAL_VALIDATION = required before production deployment
DPO_VALIDATION_BLOCKS_CODE_IMPLEMENTATION = false
DPO_VALIDATION_BLOCKS_PRODUCTION_DEPLOYMENT = true
AUDIT_RETENTION_POLICY = inherit the platform audit-log retention policy of 10 years
PKG03_SPECIFIC_RETENTION_PERIOD = none
NEW_RETENTION_CLOCK = false
POST_TEN_YEAR_DISPOSITION = governed by the platform-wide audit archival, legal-hold and deletion policy
```

Data classes are limited to the existing PKG-00 audit metadata: authenticated
user identifier, external subject identifier, tenant identifier, target user
identifier, target external subject identifier, canonical role code, request
identifier, reason code, initiator identifier, approver identifier, revoke
actor identifier, revoke reviewer identifier, timestamps and review deadline,
and operation outcome.

Prohibited audit content: passwords, access tokens, refresh tokens, identity-provider
client secrets, private keys, raw JWTs, complete identity-provider payloads,
complaint or appeal narrative, unrestricted free-text personal data,
special-category personal data, and unrelated learner, certification,
complaint, appeal, or education records.

This package does not claim that personal-data processing is absent. It claims
that PKG-03 adds no workflow store and appends only the existing audit ledger.

## D1 — external identity provider

```text
EXTERNAL_IDP_PROVIDER = NONE_SELECTED
CONCRETE_PROVIDER_ADAPTER = false
IDP_HOST = none
IDP_REALM = none
IDP_CREDENTIAL = none
CREDENTIAL_CUSTODY = none
NETWORK_ACCESS = false
PKG02_REMAINS_UNBOUND = true
PROVIDER_UNBOUND_RESULT = FAILURE_NO_APPLICATION
PROVIDER_UNBOUND_ROLE_APPLIED = false
GRANT_EXPECTED_TERMINAL_EVENT = ROLE_GRANT_FAILED
REVOKE_EXPECTED_TERMINAL_EVENT = ROLE_REVOKE_FAILED
APPLIED_EVENT_COUNT = 0
NEW_AUDIT_EVENT_ALLOWED = false
```

When PKG-02 returns `PROVIDER_UNBOUND`, `ROLE_GRANT_APPLIED` and
`ROLE_REVOKE_APPLIED` are not appended. `ROLE_GRANT_FAILED` or
`ROLE_REVOKE_FAILED` is appended. The response states that no external role
change occurred. An unapplied revoke creates no post-review deadline and no
local role state.

`ROLE_REVOKE_REVIEWED` is permitted only for a previously applied revoke. This
slice has no successful applied-revoke path and must not fabricate one.

## Exact path freeze

Governance:

- `docs/governance/R0_7D_MD05_PKG01_TO_PKG07_EXECUTION_BACKLOG_R1.md`
- `docs/governance/r0-7d-md05-pkg01-pkg07-execution-backlog-r1.yaml`
- `docs/governance/R0_7D_MD05_PKG03_POLICY_AND_SCOPE_FREEZE_R1.md`

Production:

- `apps/api/src/role-administration/role-administration-workflow.service.ts`
- `apps/api/src/role-administration/role-administration.controller.ts`
- `apps/api/src/role-administration/dto/role-administration-command.dto.ts`
- `apps/api/src/role-administration/role-administration.module.ts`

Tests:

- `apps/api/src/role-administration/role-administration-workflow.service.spec.ts`
- `apps/api/src/role-administration/role-administration.controller.spec.ts`

Schema, migration, configuration, infrastructure, dependency, and lockfile
paths: none.

Prohibited mutations:

- `packages/database/prisma/schema.prisma`
- `apps/api/src/audit/audit.service.ts`
- `frontend-app/src/lib/api-grievances.ts`
- `apps/api/src/app.module.ts` because `RoleAdministrationModule` is already imported

O01, O02, and O03 stay open. PKG-04 through PKG-07 stay `BLOCKED_POLICY`.

## Non-claims

```text
DEPLOYMENT_AUTHORIZATION = false
CI_GREEN_CLAIMED = false
CI_FAILURE_WAIVER_GRANTED = false
R0_7E_IMPLEMENTATION_AUTHORIZATION = false
GENERAL_C3_S9_IMPLEMENTATION_RESUME_AUTHORIZATION = NOT_GRANTED
PR_CREATION_ALLOWED = false
MERGE_ALLOWED = false
MD05_FORMALLY_RESOLVED = false
MD05_SCOPE_READY = false
MODEL_D = 17/9/8/8/0
```
