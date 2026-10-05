# 03 — Grant and revoke matrix

## Grant

| Pin | Value |
|-----|-------|
| COMPLAINT_HANDLER_ROLE_GRANT_AUTHORITY | STAFF_ROLEADM |
| GRANT_TENANT_SCOPE | ACTOR_TENANT_MUST_EQUAL_TARGET_USER_TENANT |
| GRANT_FOUR_EYES_REQUIRED | true |
| GRANT_INITIATOR_ROLE | STAFF_ROLEADM |
| GRANT_APPROVER_ROLE | STAFF_ROLEADM |
| GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER | true |
| TARGET_USER_MAY_NOT_BE_INITIATOR | true |
| TARGET_USER_MAY_NOT_BE_APPROVER | true |
| SELF_ASSIGNMENT_ALLOWED | false |
| CROSS_TENANT_ASSIGNMENT_ALLOWED | false |
| COMPLAINT_HANDLER_MAY_GRANT_ROLES | false |
| STAFF_SYSADM_MAY_GRANT_COMPLAINT_HANDLER | false |
| STAFF_DIR_MAY_GRANT_COMPLAINT_HANDLER | false |
| STAFF_AUD_MAY_GRANT_COMPLAINT_HANDLER | false |

A grant of `COMPLAINT_HANDLER` is valid only when all of the following hold:

1. The initiator holds `STAFF_ROLEADM`.
2. The approver holds `STAFF_ROLEADM`.
3. The initiator and the approver are different actors.
4. The target user is neither the initiator nor the approver.
5. The initiator tenant, the approver tenant, and the target user tenant are the same tenant.
6. The role code is `COMPLAINT_HANDLER`.
7. The initiator is not granting `STAFF_ROLEADM`.

## Revoke

| Pin | Value |
|-----|-------|
| COMPLAINT_HANDLER_ROLE_REVOKE_AUTHORITY | STAFF_ROLEADM |
| REVOKE_TENANT_SCOPE | ACTOR_TENANT_MUST_EQUAL_TARGET_USER_TENANT |
| REVOKE_FOUR_EYES_REQUIRED | false |
| REVOKE_POST_REVIEW_REQUIRED | true |
| REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER | true |
| REVOKE_POST_REVIEW_ROLE | STAFF_ROLEADM |
| REVOKE_POST_REVIEW_DUE_PERIOD | PROSPECTIVE_POLICY_VALUE_NOT_YET_FIXED |
| SELF_REVOCATION_ALLOWED | false |
| CROSS_TENANT_REVOCATION_ALLOWED | false |
| COMPLAINT_HANDLER_MAY_REVOKE_ROLES | false |
| STAFF_SYSADM_MAY_REVOKE_COMPLAINT_HANDLER | false |
| STAFF_DIR_MAY_REVOKE_COMPLAINT_HANDLER | false |
| STAFF_AUD_MAY_REVOKE_COMPLAINT_HANDLER | false |

Reason the revoke does not wait for a second actor before it is applied:
access removal must not be delayed where security, employment,
conflict-of-interest, or tenant-risk conditions require immediate
containment.

The post-review actor holds `STAFF_ROLEADM` and is a different actor from
the actor who applied the revoke. No hour or day duration is fixed.
`PROSPECTIVE_POLICY_VALUE_NOT_YET_FIXED` is the frozen due-period pin.

A revoke of `COMPLAINT_HANDLER` is valid only when all of the following hold:

1. The applying actor holds `STAFF_ROLEADM`.
2. The applying actor is not the target user.
3. The applying actor tenant equals the target user tenant.
4. The role code is `COMPLAINT_HANDLER`.
5. The applying actor is not revoking `STAFF_ROLEADM`.
6. A later post-review by a different `STAFF_ROLEADM` actor is required.

## STAFF_ROLEADM self-management

STAFF_ROLEADM_SELF_MANAGEMENT = forbidden

`STAFF_ROLEADM` may not grant `STAFF_ROLEADM`, revoke `STAFF_ROLEADM`,
approve its own assignment, or approve its own removal.

## Prospective audit events

Grant:

- ROLE_GRANT_REQUESTED
- ROLE_GRANT_APPROVED
- ROLE_GRANT_APPLIED
- ROLE_GRANT_REJECTED
- ROLE_GRANT_FAILED

Revoke:

- ROLE_REVOKE_REQUESTED
- ROLE_REVOKE_APPLIED
- ROLE_REVOKE_REVIEWED
- ROLE_REVOKE_REJECTED
- ROLE_REVOKE_FAILED

These names are frozen contract names. They are not registered in
`AuditEventRegistry.production()`, which is empty at the frozen base.

## Minimum fields on every prospective event

- immutable event id
- occurredAt
- tenantId
- actorUserId
- actorExternalSubjectId
- targetUserId
- targetExternalSubjectId
- role code
- request id
- reason
- decision
- previous state
- resulting state
- correlation id
- source system
- non-sensitive error classification where applicable

No credential, token, or unnecessary PII may be recorded.

ROLE_GRANT_REVOKE_IMPLEMENTED = false
