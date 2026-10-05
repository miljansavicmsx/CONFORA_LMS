# 04 — Role contract correction

Module: `packages/shared-types/src/role-administration.ts`

`packages/shared-types/src/index.ts` already re-exports the module and was not modified.

```text
TARGET_ROLE = COMPLAINT_HANDLER
ROLE_GRANT_AUTHORITY = STAFF_ROLEADM
ROLE_REVOKE_AUTHORITY = STAFF_ROLEADM
ROLE_COUNT_AFTER = 19
NEW_ROLES = COMPLAINT_HANDLER, STAFF_ROLEADM
ROLE_AUTHORITY_SOURCE = EXTERNAL_OIDC_IDP_CANONICAL
REVOKE_POST_REVIEW_DUE_PERIOD = PT24H
SELF_ASSIGNMENT_ALLOWED = false
SELF_REVOCATION_ALLOWED = false
CROSS_TENANT_ASSIGNMENT_ALLOWED = false
CROSS_TENANT_REVOCATION_ALLOWED = false
LOCAL_DATABASE_ROLE_AUTHORITY = false
```

`COMPLAINT_HANDLER` and `STAFF_ROLEADM` remain canonical RBAC roles, privileged roles, MFA-mandatory roles, and excluded from learner roles. Those classifications stay in the unchanged `roles.ts` and `auth.ts` modules.

Executable restrictions:

- `roleAdministrationTargetRoleSchema` is `z.literal('COMPLAINT_HANDLER')`. The contract `role` field uses that literal. `rbacRoleSchema` is no longer the target field.
- `roleGrantAuthorityRoleSchema` and `roleRevokeAuthorityRoleSchema` are `z.literal('STAFF_ROLEADM')`.
- Grant `initiatorRole` and `approverRole` use the grant authority literal.
- Revoke `actorRole` and `reviewerRole` use the revoke authority literal.
- `initiatorUserId` must differ from `approverUserId`. Subject identifiers must differ when both are present.
- The target user must differ from the grant initiator and from the grant approver.
- Revoke `actorUserId`, when present, is the same actor as `initiatorUserId`. A conflicting pair fails.
- `reviewerUserId` is the revoke reviewer. `approverUserId` remains only as a repository-compatible fallback and must not disagree with `reviewerUserId`.
- The reviewer must differ from the revoke actor. `ROLE_REVOKE` review requires reviewer user, reviewer subject, reviewer role, and `reviewedAt`.
- One `tenantId` binds initiator, approver, actor, reviewer, and target. `initiatorTenantId`, `approverTenantId`, `targetTenantId`, `actorTenantId`, and `reviewerTenantId` are optional and must equal `tenantId` when present. A differing actor context fails.
- An applied revoke requires `reviewDueAt` to be exactly `appliedAt` plus `PT24H` (`86400000` milliseconds). `isRevokePostReviewDuePeriod` performs that check.

No role column, role table, role-management endpoint, or identity-provider client was added.
