# 03 — Role schema transition

Historical order of the 17 identifiers is unchanged. PKG-00 appends two identifiers.

```text
ROLE_COUNT_BEFORE = 17
ROLE_COUNT_AFTER = 19
NEW_ROLE_COUNT = 2
NEW_ROLES = COMPLAINT_HANDLER, STAFF_ROLEADM
ORDERING = HISTORICAL_17_THEN_COMPLAINT_HANDLER_THEN_STAFF_ROLEADM
ALIASES_ADDED = none
LEARNER_ROLES = USR_CAND, USR_CERT
LEARNER_ROLE_RESULT = UNCHANGED
```

Privileged set keeps the historical 15 identifiers in order and appends both new roles. Count is 17.

```text
PRIVILEGED_ROLE_RESULT = BOTH_NEW_ROLES_INCLUDED
MFA_ROLE_RESULT = MFA_MANDATORY_ROLES_REMAINS_PRIVILEGED_ROLES
JWT_PARSING_RESULT = EXACT_IDENTIFIERS_ACCEPTED_UNKNOWNS_FILTERED
```

`parseRolesFromPayload` still uses `rbacRoleSchema.safeParse` and drops claims that are not exact canonical identifiers. Lowercase forms and aliases (`admin`, `sys_admin`, `staff_sysadm`, `complaint_handler`, `role_admin`) are not accepted.

Neither new role was added to `ROUTE_PERMISSIONS` or `LEARNER_ROLES`. Adding a role to the enum does not grant a route or an operation.
