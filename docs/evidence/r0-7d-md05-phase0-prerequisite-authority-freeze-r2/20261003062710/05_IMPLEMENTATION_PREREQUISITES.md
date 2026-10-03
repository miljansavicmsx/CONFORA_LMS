# 05 — Implementation prerequisites

MD05_IMPLEMENTATION_AUTHORIZATION = false

ROLE_GRANT_REVOKE_IMPLEMENTED = false

Nothing in this list is authorized by this package. A later package must be
separately authorized and independently reviewed before any item is built.

## Still outside the executable model

1. `COMPLAINT_HANDLER` is not in `rbacRoleSchema`.
2. `STAFF_ROLEADM` is not in `rbacRoleSchema`.
3. JWT parsing drops unknown role strings, so a token that carries either new identifier is ignored until the enum is changed under a later authorization.
4. `User` has no role column. Adding one would create a second role authority and is forbidden unless a separate architecture authorization allows it.
5. No membership table exists.
6. No role-grant or role-revoke endpoint exists.
7. No Keycloak Admin client exists in application source. Bootstrap remains OWNER_CONTROLLED_EXTERNAL_IDP_ADMINISTRATION and OUTSIDE_THIS_PACKAGE.
8. `AuditEventRegistry.production()` contains zero definitions.
9. `AuditEvent` stores tenant, sequence, idempotency key, actor user id, event type, outcome, optional resource type and id, timestamps, optional correlation id, optional metadata, and hash-chain fields. It does not store actor external subject id, target user id, target external subject id, role code, request id, reason, decision, previous state, or resulting state as columns.
10. Current append validation forbids override keys that include `subject`, `roles`, `oldValue`, and `newValue`. The prospective contract's external subject identifiers and previous/resulting state therefore cannot be persisted by reusing those forbidden keys. A later audit-contract authorization must define an allowlisted metadata shape that excludes credentials, tokens, and unnecessary PII.
11. `actorUserId` on `AuditEvent` is required and must reference a `User` in the same tenant. That constraint remains.
12. REVOKE_POST_REVIEW_DUE_PERIOD is PROSPECTIVE_POLICY_VALUE_NOT_YET_FIXED. A later policy authorization must set the period. This package does not invent hours or days.
13. Complaint-case operations for `COMPLAINT_HANDLER` are not authorized. Case mutation and role administration stay separate.
14. PRIMARY_PATH remains `frontend-app/src/lib/api-grievances.ts`. ADDITIONAL_PATHS remains none. That file is still absent at the frozen base. This package does not create it.
15. Privacy basis for complaint processing remains unrecorded.
16. Four-eyes and post-review controls have no server enforcement.

## Later change classes, still unauthorized

- shared role enum;
- external identity-provider role mapping and bootstrap procedure;
- grant request, approval, apply, reject, and failure handling;
- revoke apply, review, reject, and failure handling;
- tenant-equality checks on those operations;
- distinct-actor checks;
- audit-event registration and persistence that match the frozen field set;
- tests for those controls;
- UI that cannot grant server authority by visibility.

Each class needs its own owner authorization. This list is a boundary, not a
build order and not a design approval.
