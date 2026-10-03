# R0-7D MD05 — complaint-handler role Option A phase-0 prerequisite authority freeze R1

Source: Repository Owner message dated 2026-10-03.

Authorization, single-use, consumed by this candidate:

`OWNER_SELECT_R0_7D_MD05_COMPLAINT_HANDLER_ROLE_OPTION_A_AND_AUTHORIZE_PHASE0_PREREQUISITE_AUTHORITY_FREEZE_R1`

This package records the owner selection of Option A and freezes that
selection as prerequisite authority. It does not add the role to code, does
not name who may grant or revoke it, and does not authorize implementation.

```text
OWNER_SELECT_R0_7D_MD05_COMPLAINT_HANDLER_ROLE_OPTION_A_AND_AUTHORIZE_PHASE0_PREREQUISITE_AUTHORITY_FREEZE_R1 = CONSUMED

PACKAGE_ID =
R0-7D-MD05-COMPLAINT-HANDLER-ROLE-OPTION-A-PHASE0-PREREQUISITE-AUTHORITY-FREEZE-R1

BASE_BRANCH = fix/ca-h01-frontend-f4-cutover
BASE_HEAD = 72a8935d48cfaef7fe8c2273554a79aa584a1741
BASE_TREE = c7d594c53bc2986eb68365a1c3e2c116c855761f

PREDECESSOR_BLUEPRINT =
R0-7D-MD05-ALTERNATIVE-A-IMPLEMENTATION-BLUEPRINT-AND-EXACT-SCOPE-FREEZE-R1
PREDECESSOR_INTEGRATION_PR = 50
PREDECESSOR_MERGE_COMMIT = 72a8935d48cfaef7fe8c2273554a79aa584a1741
PREDECESSOR_MERGE_PARENT_1 = 1c2f649d0d73c800bdf563ef6ce5027169a4e816
PREDECESSOR_MERGE_PARENT_2 = 208e29b9c152feff78c17372fa164b264734ff33
PREDECESSOR_MERGE_TREE_EQUALS_CANDIDATE_TREE = true

SELECTED_OPTION = A
SELECTED_OPTION_NAME = NEW_DEDICATED_COMPLAINT_HANDLER
COMPLAINT_HANDLER_HUMAN_NAME = Complaint handler
COMPLAINT_HANDLER_ROLE = COMPLAINT_HANDLER
COMPLAINT_HANDLER_ROLE_ADOPTED = true
COMPLAINT_HANDLER_ROLE_IMPLEMENTED_IN_RBAC_ENUM = false
ROLE_GRANT_AUTHORITY = NOT_NAMED
ROLE_REVOKE_AUTHORITY = NOT_NAMED
OPTION_B_EXISTING_ROLE = NOT_SELECTED
OPTION_B_VIABLE_ON_CURRENT_TREE = false
OPTION_C_KEEP_NOT_NAMED = NOT_SELECTED

MD05_PRIMARY_PATH = frontend-app/src/lib/api-grievances.ts
MD05_ADDITIONAL_PATHS = none
MD05_SCOPE_EXPANSION_ADOPTED = false
MD05_IMPLEMENTATION_AUTHORIZATION = false
MD05_FORMALLY_RESOLVED = false
MD05_SCOPE_READY = false
MODEL_D = 17/9/8/8/0
MODEL_D_MUTATION_COUNT = 0

PKG_01_IMPLEMENTATION_AUTHORIZATION = false
PRODUCTION_SOURCE_CHANGED_PATH_COUNT = 0
```

## Selected role

Option A is a new canonical role identifier, `COMPLAINT_HANDLER`. It is not
present in `packages/shared-types/src/roles.ts` on this base. This package
does not add it.

The owner message did not name a grantor or a revoker. Those authorities
stay `NOT_NAMED`. This package does not invent them.

Option B is not selected. No existing role in `rbacRoleSchema` is a
complaint handler. `COM_APP` remains the appeals committee. `COM_CERT`,
`STAFF_DIR`, `STAFF_SYSADM`, and `STAFF_AUD` are not substitutes.

## Frozen duties

Allowed, once a later package implements the role:

- read staff complaints in the actor tenant
- acknowledge a complaint
- void a complaint with a reason
- assign an investigator who is a different user

Prohibited:

- appeal acknowledge, void, decision start, and outcome
- certificate issue, revoke, or alteration
- exam-result or certification-decision edits
- borrowing `COM_CERT`, `COM_APP`, `STAFF_DIR`, `STAFF_SYSADM`, or `STAFF_AUD`

Administrator and auditor remain non-mutation roles. The original
certification decision-maker still cannot decide the related appeal.
`resolutionCommitteeId` remains a server committee reference, not a role
label. Authenticated case user ids remain required. Tenant authority
remains server-side.

## Non-claims

This freeze does not restore `frontend-app/src/lib/api-grievances.ts`, does
not create `apps/api/src/cert-appeals/` or `apps/api/src/cert-complaints/`,
does not expand MD05 additional paths, does not change Model D, and does
not resolve MD05. It does not authorize PKG-01 or any later prerequisite
package. It does not resume general C3-S9, authorize R0-7E, authorize
deployment, or waive CI.

```text
NEXT_ACTION =
OWNER_AUTHORIZE_INDEPENDENT_CURSOR_R0_7D_MD05_COMPLAINT_HANDLER_ROLE_OPTION_A_PHASE0_PREREQUISITE_AUTHORITY_FREEZE_R1_REVIEW
```

That independent-review authorization is not granted by this package.
