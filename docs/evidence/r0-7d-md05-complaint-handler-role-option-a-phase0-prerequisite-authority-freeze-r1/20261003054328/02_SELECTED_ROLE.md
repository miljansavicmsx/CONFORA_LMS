# Selected role

```text
RECORD_UTC = 2026-10-03T05:43:28Z
SELECTED_OPTION = A
COMPLAINT_HANDLER_HUMAN_NAME = Complaint handler
COMPLAINT_HANDLER_ROLE = COMPLAINT_HANDLER
NEW_OR_EXISTING = NEW
COMPLAINT_HANDLER_ROLE_ADOPTED = true
COMPLAINT_HANDLER_ROLE_IMPLEMENTED_IN_RBAC_ENUM = false
ROLE_GRANT_AUTHORITY = NOT_NAMED
ROLE_REVOKE_AUTHORITY = NOT_NAMED
OPTION_B = NOT_SELECTED
OPTION_C = NOT_SELECTED
```

Allowed operations after a later implementation authorization:

- read staff complaints in the token tenant
- acknowledge a complaint
- void a complaint when a reason is present
- assign an investigator who is not the handler

Prohibited operations:

- appeal acknowledge, void, decision start, and outcome
- certificate lifecycle changes
- exam-result changes
- certification-decision changes
- use of `COM_CERT`, `COM_APP`, `STAFF_DIR`, `STAFF_SYSADM`, or `STAFF_AUD` as this role

Tenant scope is the JWT `tenant_id` only. The owner did not name who may
grant or revoke the role. Those two authorities remain unnamed and are not
inferred.
