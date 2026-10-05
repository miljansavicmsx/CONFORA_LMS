# 04 — Role-administration contract

Module: `packages/shared-types/src/role-administration.ts`

Exported from `packages/shared-types/src/index.ts`.

The contract is a strict Zod object. `role` uses `rbacRoleSchema`. The contract does not perform a grant or a revoke and has no network behavior.

Represented fields:

- operation (`GRANT` or `REVOKE`)
- tenantId
- requestId
- targetUserId
- targetExternalSubjectId
- role
- initiatorUserId
- initiatorExternalSubjectId
- approverUserId where required
- approverExternalSubjectId where required
- reasonCode
- decision
- requestedAt
- decidedAt where applicable
- appliedAt where applicable
- previousState
- resultingState
- correlationId
- sourceSystem (`EXTERNAL_OIDC_IDP_CANONICAL`)

Policy encoded in the same module:

```text
SELF_ASSIGNMENT_ALLOWED = false
SELF_REVOCATION_ALLOWED = false
CROSS_TENANT_ASSIGNMENT_ALLOWED = false
CROSS_TENANT_REVOCATION_ALLOWED = false
GRANT_FOUR_EYES_REQUIRED = true
GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER = true
REVOKE_FOUR_EYES_REQUIRED = false
REVOKE_POST_REVIEW_REQUIRED = true
REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER = true
REVOKE_POST_REVIEW_DUE_PERIOD = PT24H
REVOKE_POST_REVIEW_DUE_PERIOD_MS = 86400000
STAFF_ROLEADM_SELF_MANAGEMENT_ALLOWED = false
LOCAL_DATABASE_ROLE_AUTHORITY = false
ROLE_CONTRACT_RESULT = PASS
```

`PT24H` is a named ISO-8601 elapsed duration. The millisecond constant is `24 * 60 * 60 * 1000`. Neither value is a locale calendar calculation.

Cross-tenant assignment cannot be represented as permitted input. The contract has one `tenantId`. Unknown tenant fields are rejected. `evaluateRoleAdministrationPolicy` returns a cross-tenant violation when the caller-supplied actor tenant differs from that single tenant.

`reasonCode` is a bounded upper-snake token. Credentials, tokens, and free-form PII are not contract fields.

Bootstrap of `STAFF_ROLEADM` remains `OWNER_CONTROLLED_EXTERNAL_IDP_ADMINISTRATION` and is not implemented here.
