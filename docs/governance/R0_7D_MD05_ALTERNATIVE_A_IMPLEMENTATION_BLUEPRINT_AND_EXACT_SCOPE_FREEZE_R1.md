# R0-7D MD05 Alternative A — implementation blueprint and exact scope freeze R1

Source: Repository Owner message dated 2026-10-02.

Authorization, single-use, consumed by this candidate:

`OWNER_AUTHORIZE_R0_7D_MD05_ALTERNATIVE_A_IMPLEMENTATION_BLUEPRINT_AND_EXACT_SCOPE_FREEZE_R1`

This package freezes the MD05 Alternative A exact path boundary and the
detailed RBAC / segregation-of-duties matrix, and records an implementation
blueprint. It is a Level 1 candidate with Level 7 supporting evidence. It is
not integration authority until independent review and later owner-authorized
pull request and merge. It does not authorize residual implementation.

```text
OWNER_AUTHORIZE_R0_7D_MD05_ALTERNATIVE_A_IMPLEMENTATION_BLUEPRINT_AND_EXACT_SCOPE_FREEZE_R1 = CONSUMED

PACKAGE_ID =
R0-7D-MD05-ALTERNATIVE-A-IMPLEMENTATION-BLUEPRINT-AND-EXACT-SCOPE-FREEZE-R1

BASE_BRANCH = fix/ca-h01-frontend-f4-cutover
BASE_HEAD = 1c2f649d0d73c800bdf563ef6ce5027169a4e816
BASE_TREE = 68ebd509592ddb99113a6e7c60a1158f689e6449

PREDECESSOR_ARCHITECTURE_DECISION = ALTERNATIVE_A_CLOSED_ACCEPTED
PREDECESSOR_DECISION_FREEZE =
R0-7D-MD05-CANONICAL-ARCHITECTURE-ALTERNATIVE-A-DECISION-FREEZE-R2
PREDECESSOR_STATUS_ALIGNMENT =
R0-7D-MD05-CANONICAL-ARCHITECTURE-ALTERNATIVE-A-DECISION-FREEZE-R2-POST-INTEGRATION-STATUS-ALIGNMENT-R3
PREDECESSOR_ALIGNMENT_MERGE = 1c2f649d0d73c800bdf563ef6ce5027169a4e816

SELECTED_ALTERNATIVE = A
MD05_CANONICAL_ARCHITECTURE =
SEPARATE_CANONICAL_APPEALS_AND_COMPLAINTS_MODULES
MD05_ARCHITECTURE_DECISION = ALTERNATIVE_A_CLOSED_ACCEPTED

MD05_ADDITIONAL_PATH_BOUNDARY_STATUS = FROZEN
MD05_ADDITIONAL_PATH_BOUNDARY_FROZEN = true
MD05_SCOPE_EXPANSION_ADOPTED = false
ADDITIONAL_PATH_COUNT = 0
MD05_PRIMARY_PATH = frontend-app/src/lib/api-grievances.ts
MD05_ADDITIONAL_PATHS = none

DETAILED_RBAC_SOD_MATRIX_STATUS = FROZEN
SOD_MATRIX_FROZEN = true
SOD_COMPLETE_CLAIMED = false
OQ_5_STATUS = DIRECTIONAL
COMPLAINT_HANDLER_ROLE = NOT_NAMED

IMPLEMENTATION_BLUEPRINT_RECORDED = true
MD05_IMPLEMENTATION_AUTHORIZATION = false
MD05_FORMALLY_RESOLVED = false
MD05_REMAINS_SINGLE_MODEL_D_ITEM = true
MD05_STATUS =
UNRESOLVED_SCOPE_FROZEN_PENDING_IMPLEMENTATION_AUTHORIZATION

MODEL_D = 17/9/8/8/0
MODEL_D_MUTATION_COUNT = 0
NEWLY_RESOLVED_ITEM_COUNT = 0

CANONICAL_BACKEND_OWNERSHIP =
apps/api/src/cert-appeals/
apps/api/src/cert-complaints/
CANONICAL_BACKEND_OWNERSHIP_IN_MD05_PATH_FREEZE = false
CANONICAL_BACKEND_MODULES_PRESENT_ON_BASE = false

LEGACY_V1_ALIAS_ROUTING_CANONICAL = false
HISTORICAL_COMMIT_A277A19_IMPLEMENTATION_AUTHORITY = false
APPEAL_RESOLUTION_COMMITTEE_ID_REQUIRED = true
AUTHENTICATED_CASE_EMPTY_USER_ID_ALLOWED = false
IMMUTABLE_CASE_AUDIT_EVENTS_REQUIRED = true
TENANT_ISOLATION_REQUIRED = true
ORIGINAL_CERTIFICATION_DECISION_MAKER_MAY_APPROVE_APPEAL = false
ADMINISTRATOR_CASE_DECISION_ROLE = false
AUDITOR_CASE_MUTATION_ROLE = false

PRIVACY_BASIS_RECORDED = false
GENERAL_C3_S9_IMPLEMENTATION_RESUME_AUTHORIZATION = NOT_GRANTED
R0_7E_IMPLEMENTATION_AUTHORIZATION = false
DEPLOYMENT_AUTHORIZATION = false
CI_GREEN_CLAIMED = false
CI_FAILURE_WAIVER_GRANTED = false

PR_41_STATUS =
HISTORICAL_NONAUTHORITATIVE_DESIGN_NOTE_NOT_TO_BE_MERGED
PR_41_MUTATION_AUTHORIZATION = false
PR_42_STATUS =
PRESERVED_UNMERGED_NONAUTHORITATIVE_ATTEMPT
PR_42_MUTATION_AUTHORIZATION = false
PR_46_MUTATION_AUTHORIZATION = false
PR_48_MUTATION_AUTHORIZATION = false

DESIGN_PACKAGE_SHA256 =
fcc012bf7ff6b2c86fe0b3fd6d41ec6cf3ff733de227c18a26c350fa4f9afad2
DESIGN_PACKAGE_BINARY_REHASH =
NOT_PERFORMED_RETAIN_I2_NOT_VERIFIED
```

## Exact path boundary (frozen)

MD05 remains a single Model D item. The prospective eight-path freeze
PRIMARY_PATH for MD05 stays `frontend-app/src/lib/api-grievances.ts`.
ADDITIONAL_PATHS stay none. This package freezes that boundary; it does
not expand it.

Named Alternative A backend ownership directories
`apps/api/src/cert-appeals/` and `apps/api/src/cert-complaints/` remain
architecture ownership names only. They are outside the MD05 path freeze
and are not created by this package. Creating them requires a later
owner-authorized package that is not this freeze.

Missing historical facade imports under `frontend-app/src/lib/api/`
(`appeals-client.ts`, `appeals-types.ts`, `appeals-category.util.ts`)
remain outside the MD05 ADDITIONAL_PATHS set. Restoring or rewriting them
requires a later owner decision that either expands MD05 ADDITIONAL_PATHS
or authorizes a separate package. Copying `a277a19` is prohibited.

`frontend-app/src/lib/staff-appeals-complaints-access.ts` and existing
grievance UI consumers remain outside the MD05 path freeze. The frozen
SoD matrix constrains any later authorized change to those surfaces; this
package does not edit them.

## Detailed RBAC / SoD matrix (frozen)

| Actor / rule | Frozen requirement |
| --- | --- |
| Appellant / complainant | Authenticated learner or candidate; own cases only |
| Public submitter | Unauthenticated complaint intake only; no appeal; no staff mutation |
| Appeals committee member (`appeals_committee`) | May acknowledge, void, start, and record appeal outcome only when the server proves the actor is not the original certification decision-maker for that case |
| Original certification decision-maker | Prohibited from appeal acknowledge, void, decision start, and decision outcome for that appeal |
| Complaint handler | `COMPLAINT_HANDLER_ROLE = NOT_NAMED`; may not borrow `com_cert`, `admin`, `sys_admin`, `director`, or `auditor` |
| Auditor | No case mutation |
| Administrator, sys_admin, director, training_admin, staff_dir, staff_sysadm, com_app, com_imp, com_cert | Not appeal or complaint mutation roles under this freeze |
| Committee identity | Server-side constituted committee reference required; role label string is not a committee id |
| Certificate issue / revoke / alter via this residual | Forbidden |

Complete SoD / RBAC is not claimed. OQ-5 remains DIRECTIONAL. Current
`evaluateStaffAppealsComplaintsAccess` allow-list remains a known defect
relative to this freeze and is not patched here.

## Implementation blueprint (recorded; not authorized)

1. Prerequisites outside this MD05 path freeze, each requiring later
   owner authorization: canonical Nest modules under the named ownership
   directories; Prisma or equivalent case storage; immutable audit event
   append; tenant enforcement; named complaint-handler role; recorded
   privacy basis for residual personal data.
2. MD05 residual, when separately authorized: restore only
   `frontend-app/src/lib/api-grievances.ts` as a thin canonical facade
   that does not call legacy `/v1/me/*` or `/v1/admin/*` aliases, does
   not blank authenticated subject ids, forwards a real committee
   reference, and surfaces decision-start 409 without swallowing it.
3. Facade must not write the audit trail; the server does.
4. Tests required in a later authorized package: original-decider
   refusal, tenant non-leak, 409 behaviour, and absence of legacy appeal
   alias calls.
5. This blueprint does not restore source, create backends, expand
   paths, name the complaint handler, or grant implementation.

Canonical route targets remain design targets only:

- Appeals: `/v1/learner/appeals`, `/v1/staff/appeals` and staff
  acknowledge / void / decision start / decision outcome
- Complaints: `/v1/public/complaints`, `/v1/learner/complaints`,
  `/v1/staff/complaints` and staff acknowledge / void

Legacy aliases remain non-canonical and out of MD05 scope.

```text
NEXT_ACTION =
OWNER_AUTHORIZE_INDEPENDENT_CURSOR_R0_7D_MD05_ALTERNATIVE_A_IMPLEMENTATION_BLUEPRINT_AND_EXACT_SCOPE_FREEZE_R1_REVIEW
```

That independent-review authorization is not granted by this package.
Implementation authorization is not granted by this package.
