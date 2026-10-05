# R0-7D MD05 Phase 0 — prerequisite role-administration authority freeze R2

Source: Repository Owner message dated 2026-10-03.

Authorization, single-use, consumed by this candidate:

`OWNER_SELECT_R0_7D_MD05_ROLE_ADMINISTRATION_OPTION_1_STAFF_ROLEADM_AND_AUTHORIZE_PHASE0_PREREQUISITE_AUTHORITY_FREEZE_R2_CLEAN_REISSUANCE`

This package freezes the MD05 Phase 0 role identifiers and the grant and
revoke authority contract. It is a Level 1 candidate with Level 7 supporting
evidence. It is not integration authority until independent review and a later
owner-authorized pull request and merge. It does not authorize residual
implementation.

```text
AUTHORIZATION_STATUS = CONSUMED
EXECUTION_ENGINE = CURSOR
THIS_RUN_BCID = bc-050f1554-ee78-4f54-8fb7-614c729971b5

PACKAGE_ID =
R0-7D-MD05-PHASE0-PREREQUISITE-AUTHORITY-FREEZE-R2

BASE_BRANCH = fix/ca-h01-frontend-f4-cutover
BASE_HEAD = 72a8935d48cfaef7fe8c2273554a79aa584a1741
BASE_TREE = c7d594c53bc2986eb68365a1c3e2c116c855761f

R1_BRANCH = cursor/r0-7d-md05-phase0-role-freeze-r1-71b5
R1_COMMIT = 7f6e2ba05f0abe569111a90594689519fec96304
R1_STATUS = INCOMPLETE_NON_AUTHORITATIVE_ATTEMPT
R1_PARENT_USED_FOR_R2 = false
R1_PRESERVED = true

ROLE_ADMINISTRATION_OPTION = OPTION_1_DEDICATED_AUTHORITY

COMPLAINT_HANDLER_ROLE = COMPLAINT_HANDLER
COMPLAINT_HANDLER_ROLE_ADOPTED = true
COMPLAINT_HANDLER_ROLE_IMPLEMENTED = false

ROLE_ADMINISTRATOR_ROLE = STAFF_ROLEADM
ROLE_ADMINISTRATOR_LABEL = RBAC Role Administrator
ROLE_ADMINISTRATOR_ROLE_ADOPTED = true
ROLE_ADMINISTRATOR_ROLE_IMPLEMENTED = false

ROLE_AUTHORITY_SOURCE = EXTERNAL_OIDC_IDP_CANONICAL
LOCAL_DATABASE_ROLE_AUTHORITY = false
JWT_ROLE_CLAIMS_REMAIN_READ_ONLY_IN_APPLICATION = true

COMPLAINT_HANDLER_ROLE_GRANT_AUTHORITY = STAFF_ROLEADM
COMPLAINT_HANDLER_ROLE_REVOKE_AUTHORITY = STAFF_ROLEADM

GRANT_TENANT_SCOPE = ACTOR_TENANT_MUST_EQUAL_TARGET_USER_TENANT
REVOKE_TENANT_SCOPE = ACTOR_TENANT_MUST_EQUAL_TARGET_USER_TENANT

GRANT_FOUR_EYES_REQUIRED = true
GRANT_INITIATOR_ROLE = STAFF_ROLEADM
GRANT_APPROVER_ROLE = STAFF_ROLEADM
GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER = true
TARGET_USER_MAY_NOT_BE_INITIATOR = true
TARGET_USER_MAY_NOT_BE_APPROVER = true

REVOKE_FOUR_EYES_REQUIRED = false
REVOKE_POST_REVIEW_REQUIRED = true
REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER = true
REVOKE_POST_REVIEW_ROLE = STAFF_ROLEADM
REVOKE_POST_REVIEW_DUE_PERIOD = PROSPECTIVE_POLICY_VALUE_NOT_YET_FIXED

SELF_ASSIGNMENT_ALLOWED = false
SELF_REVOCATION_ALLOWED = false
CROSS_TENANT_ASSIGNMENT_ALLOWED = false
CROSS_TENANT_REVOCATION_ALLOWED = false

COMPLAINT_HANDLER_MAY_GRANT_ROLES = false
COMPLAINT_HANDLER_MAY_REVOKE_ROLES = false
STAFF_SYSADM_MAY_GRANT_COMPLAINT_HANDLER = false
STAFF_SYSADM_MAY_REVOKE_COMPLAINT_HANDLER = false
STAFF_DIR_MAY_GRANT_COMPLAINT_HANDLER = false
STAFF_DIR_MAY_REVOKE_COMPLAINT_HANDLER = false
STAFF_AUD_MAY_GRANT_COMPLAINT_HANDLER = false
STAFF_AUD_MAY_REVOKE_COMPLAINT_HANDLER = false

STAFF_ROLEADM_SELF_MANAGEMENT = forbidden
STAFF_ROLEADM_BOOTSTRAP_AUTHORITY =
OWNER_CONTROLLED_EXTERNAL_IDP_ADMINISTRATION
STAFF_ROLEADM_BOOTSTRAP_IMPLEMENTATION = OUTSIDE_THIS_PACKAGE

ROLE_GRANT_REVOKE_AUTHORITY_FROZEN = true
ROLE_GRANT_REVOKE_IMPLEMENTED = false

PHASE0_STATUS = ROLE_AUTHORITY_FROZEN_PENDING_INDEPENDENT_REVIEW

PRIMARY_PATH = frontend-app/src/lib/api-grievances.ts
ADDITIONAL_PATHS = none
MD05_SCOPE_READY = false
MD05_FORMALLY_RESOLVED = false
MD05_IMPLEMENTATION_AUTHORIZATION = false
MODEL_D = 17/9/8/8/0
MODEL_D_MUTATION_COUNT = 0

GENERAL_C3_S9_IMPLEMENTATION_RESUME_AUTHORIZATION = NOT_GRANTED
R0_7E_IMPLEMENTATION_AUTHORIZATION = false
DEPLOYMENT_AUTHORIZATION = false
CI_GREEN_CLAIMED = false
CI_FAILURE_WAIVER_GRANTED = false
```

## 1. Lineage

R2 is a clean candidate whose direct parent is the frozen base
`72a8935d48cfaef7fe8c2273554a79aa584a1741`.

R1 remains on `cursor/r0-7d-md05-phase0-role-freeze-r1-71b5` at
`7f6e2ba05f0abe569111a90594689519fec96304`. That commit recorded
`COMPLAINT_HANDLER` as a governance selection and left grant and revoke
authority `NOT_NAMED`. R1 is preserved. It is not rewritten, deleted,
cherry-picked, or rebased into R2. It is not an ancestor of R2 and is not
used as the R2 parent. R1 stays an incomplete non-authoritative attempt.

The read-only discovery that preceded this selection found no implemented
grant or revoke operation, no role column on `User`, an empty production
audit-event registry, and no role-administration test. This package records
the owner selection of Option 1. It does not implement that selection.

## 2. Role model

`COMPLAINT_HANDLER` is adopted as the complaint-handler role identifier.
`STAFF_ROLEADM` is adopted as the RBAC Role Administrator. Both identifiers
are governance selections. Neither identifier is a member of
`packages/shared-types/src/roles.ts` `rbacRoleSchema` at the frozen base, and
this package does not add either identifier to that enum.

The canonical role authority is the external OIDC identity provider. The
application continues to read role claims from the JWT. It must not create a
second role authority in `User`, in a tenant-membership table, or in an
application-local role column unless a later architecture change is
separately authorized.

`STAFF_ROLEADM` bootstrap authority is owner-controlled external identity
provider administration. That mechanism is outside this package. This package
does not claim that a Keycloak Admin client exists in the repository. At the
frozen base, application source contains no Keycloak Admin client and no
role-assignment endpoint.

Holding `STAFF_ROLEADM` does not grant complaint-case mutation rights.
Holding `COMPLAINT_HANDLER` does not grant role-management rights.
`COMPLAINT_HANDLER` may later receive only separately authorized,
server-enforced complaint operations. No frontend visibility predicate grants
server authority.

## 3. Grant authority

Only `STAFF_ROLEADM` may initiate or approve a grant of `COMPLAINT_HANDLER`.
The actor tenant must equal the target user's tenant. Four eyes are required.
The initiator and the approver must both hold `STAFF_ROLEADM` and must be
different actors. The target user may not be the initiator and may not be
the approver. Self-assignment is forbidden. Cross-tenant assignment is
forbidden.

`COMPLAINT_HANDLER`, `STAFF_SYSADM`, `STAFF_DIR`, and `STAFF_AUD` may not
grant `COMPLAINT_HANDLER`. Those prohibitions are owner constraints. They are
not inferences from role labels. Discovery found no implemented grant
authority on any of those roles.

Prospective audit-event names, not implemented by this package:

- `ROLE_GRANT_REQUESTED`
- `ROLE_GRANT_APPROVED`
- `ROLE_GRANT_APPLIED`
- `ROLE_GRANT_REJECTED`
- `ROLE_GRANT_FAILED`

## 4. Revoke authority

Only `STAFF_ROLEADM` may revoke `COMPLAINT_HANDLER`. The actor tenant must
equal the target user's tenant. Four eyes are not required before the revoke
is applied. Access removal must not be delayed where security, employment,
conflict-of-interest, or tenant-risk conditions require immediate containment.

A post-review is required. The post-review actor must hold `STAFF_ROLEADM`
and must be a different actor from the actor who applied the revoke. The
post-review due period is `PROSPECTIVE_POLICY_VALUE_NOT_YET_FIXED`. This
package fixes no duration in hours or days.

Self-revocation is forbidden. Cross-tenant revocation is forbidden.
`COMPLAINT_HANDLER`, `STAFF_SYSADM`, `STAFF_DIR`, and `STAFF_AUD` may not
revoke `COMPLAINT_HANDLER`.

Prospective audit-event names, not implemented by this package:

- `ROLE_REVOKE_REQUESTED`
- `ROLE_REVOKE_APPLIED`
- `ROLE_REVOKE_REVIEWED`
- `ROLE_REVOKE_REJECTED`
- `ROLE_REVOKE_FAILED`

## 5. Prospective audit-event contract

Every prospective grant and revoke event must contain at minimum:

- immutable event id;
- occurredAt;
- tenantId;
- actorUserId;
- actorExternalSubjectId;
- targetUserId;
- targetExternalSubjectId;
- role code;
- request id;
- reason;
- decision;
- previous state;
- resulting state;
- correlation id;
- source system;
- non-sensitive error classification where applicable.

No credential, token, or unnecessary PII may be recorded. External subject
identifiers are identity-provider subjects, not copies of tokens, passwords,
or email addresses.

These names are a frozen prospective contract. `AuditEventRegistry.production()`
at the frozen base is empty. The current `AuditEvent` model does not store
this field set as columns. Implementing the contract requires a separately
authorized audit-contract change. This package does not register events and
does not write audit rows.

## 6. STAFF_ROLEADM limits

`STAFF_ROLEADM` self-management is forbidden. `STAFF_ROLEADM` may not:

- grant `STAFF_ROLEADM`;
- revoke `STAFF_ROLEADM`;
- approve its own assignment;
- approve its own removal;
- change the identity-provider authority configuration;
- manage users outside its tenant;
- process complaints by virtue of `STAFF_ROLEADM`;
- make certification or appeal decisions;
- suppress or modify audit history.

Bootstrap of the first `STAFF_ROLEADM` assignment is
`OWNER_CONTROLLED_EXTERNAL_IDP_ADMINISTRATION` and is
`OUTSIDE_THIS_PACKAGE`.

## 7. Segregation of duties

`COMPLAINT_HANDLER` and `STAFF_ROLEADM` are separate roles.

For the same complaint or related appeal, the following are prohibited:

- intake plus investigation plus final approval by one actor;
- a complaint handler acting as the appeal resolution committee;
- the original certification decision-maker deciding the related appeal;
- an auditor mutating case state;
- a role administrator using role assignment to participate in a case;
- a director using governance oversight as operational authority;
- a system administrator inferring case or role authority from its label.

Baseline §7 remains in force: the director does not perform operational
certification decisions, and the system administrator does not override
certification outcomes. Those baseline sentences are not grant or revoke
authority.

## 8. Governance status

```text
MODEL_D = 17/9/8/8/0
MODEL_D_MUTATION_COUNT = 0
MD05_FORMALLY_RESOLVED = false
MD05_SCOPE_READY = false
MD05_IMPLEMENTATION_AUTHORIZATION = false
PRIMARY_PATH = frontend-app/src/lib/api-grievances.ts
ADDITIONAL_PATHS = none
PHASE0_STATUS = ROLE_AUTHORITY_FROZEN_PENDING_INDEPENDENT_REVIEW
GENERAL_C3_S9_IMPLEMENTATION_RESUME_AUTHORIZATION = NOT_GRANTED
R0_7E_IMPLEMENTATION_AUTHORIZATION = false
DEPLOYMENT_AUTHORIZATION = false
CI_GREEN_CLAIMED = false
CI_FAILURE_WAIVER_GRANTED = false
```

Model D arithmetic is unchanged. MD05 remains one unresolved item. This
package does not resolve MD05, does not expand `ADDITIONAL_PATHS`, and does
not authorize implementation.

## 9. Non-claims

This package does not:

- modify `packages/shared-types/src/roles.ts`;
- modify production source, tests, Prisma schema, migrations, configuration,
  infrastructure, dependencies, or lockfiles;
- modify existing historical evidence;
- create a pull request;
- merge;
- delete or rewrite R1;
- claim CI green or waive CI failures;
- claim that grant, revoke, four-eyes, or post-review controls execute;
- claim that a Keycloak Admin client exists;
- fix a post-review duration;
- grant C3-S9 resume, R0-7E, or deployment authority.

Next action, not granted by this package:

`OWNER_AUTHORIZE_INDEPENDENT_CURSOR_R0_7D_MD05_PHASE0_PREREQUISITE_AUTHORITY_FREEZE_R2_REVIEW`
