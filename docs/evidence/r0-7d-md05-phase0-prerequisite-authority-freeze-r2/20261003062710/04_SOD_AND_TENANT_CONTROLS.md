# 04 — Segregation of duties and tenant controls

## Role separation

`COMPLAINT_HANDLER` and `STAFF_ROLEADM` are separate roles.

| Holder | Complaint-case mutation | Role grant | Role revoke |
|--------|-------------------------|------------|-------------|
| COMPLAINT_HANDLER | not granted by this package | forbidden | forbidden |
| STAFF_ROLEADM | forbidden by virtue of this role | `COMPLAINT_HANDLER` only, under the grant contract | `COMPLAINT_HANDLER` only, under the revoke contract |
| STAFF_SYSADM | not inferred | forbidden for `COMPLAINT_HANDLER` | forbidden for `COMPLAINT_HANDLER` |
| STAFF_DIR | not inferred | forbidden for `COMPLAINT_HANDLER` | forbidden for `COMPLAINT_HANDLER` |
| STAFF_AUD | forbidden | forbidden for `COMPLAINT_HANDLER` | forbidden for `COMPLAINT_HANDLER` |

Complaint operations for `COMPLAINT_HANDLER` remain separately unauthorized.
This package does not list server operations as granted.

## Same complaint or related appeal

The following are prohibited for the same complaint or related appeal:

1. Intake plus investigation plus final approval by one actor.
2. Complaint handler acting as the appeal resolution committee.
3. Original certification decision-maker deciding the related appeal.
4. Auditor mutating case state.
5. Role administrator using role assignment to participate in a case.
6. Director using governance oversight as operational authority.
7. System administrator inferring case or role authority from its label.

## Baseline §7 retained

1. A person involved in training delivery for a candidate shall not participate in the certification decision for the same candidate or application.
2. A certification committee member shall not decide an appeal against their own decision.
3. A candidate shall not hold committee roles in relation to their own certification process.
4. The director may monitor governance and KPIs and shall not perform operational certification decisions.
5. The system administrator shall not override certification outcomes.
6. AI-generated outputs shall not bypass human review where ISO/IEC 17024 requires certification-body responsibility.

SoD must be enforced server-side. A frontend visibility predicate does not
grant server authority.

## Tenant boundary

GRANT_TENANT_SCOPE = ACTOR_TENANT_MUST_EQUAL_TARGET_USER_TENANT

REVOKE_TENANT_SCOPE = ACTOR_TENANT_MUST_EQUAL_TARGET_USER_TENANT

CROSS_TENANT_ASSIGNMENT_ALLOWED = false

CROSS_TENANT_REVOCATION_ALLOWED = false

`STAFF_ROLEADM` may not manage users outside its tenant.

At the frozen base, tenant binding exists for authentication: JWT `tenant_id`
must be present, and `User.tenantId` scopes the resolved user. No role-write
operation exists yet. The equality rule is frozen for the later authorized
implementation. It is not an executing control in this package.

## Self-actions

SELF_ASSIGNMENT_ALLOWED = false

SELF_REVOCATION_ALLOWED = false

TARGET_USER_MAY_NOT_BE_INITIATOR = true

TARGET_USER_MAY_NOT_BE_APPROVER = true

GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER = true

REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER = true

STAFF_ROLEADM_SELF_MANAGEMENT = forbidden

## Audit history

`STAFF_ROLEADM` may not suppress or modify audit history. Prospective events
are append-only contract names. This package writes no audit rows.
