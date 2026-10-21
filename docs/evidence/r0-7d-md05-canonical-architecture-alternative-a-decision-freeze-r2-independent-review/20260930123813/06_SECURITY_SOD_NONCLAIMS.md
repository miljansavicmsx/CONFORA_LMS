# Security, privacy, and segregation-of-duties nonclaims

```text
REVIEW_UTC = 2026-09-30T12:38:13Z

SECURITY_CONTROL_IMPLEMENTATION_COUNT = 0
BACKEND_MODULE_CREATED_COUNT = 0
SCHEMA_CHANGED_PATH_COUNT = 0
PII_HANDLER_IMPLEMENTED = false
AUDIT_LEDGER_MUTATED = false
CREDENTIAL_MATERIAL_INTRODUCED = false
RBAC_MATRIX_FROZEN = false
SOD_MATRIX_FROZEN = false
ADDITIONAL_PATH_BOUNDARY_FROZEN = false
BACKEND_READY_CLAIMED = false
SERVER_SOD_ENFORCEMENT_VERIFIED = false
SERVER_TENANT_ENFORCEMENT_VERIFIED = false
AUDIT_IMPLEMENTATION_VERIFIED = false
```

ISO/IEC 17024-aligned architecture constraints remain recorded as design
and decision facts only:

- appeals and complaints are separate canonical modules;
- the original certification decision-maker may not approve the appeal;
- administrator is not a case decision role;
- auditor is not a case mutation role;
- immutable case audit events and tenant isolation are required.

Those constraints are not implemented by the candidate and are not
verified as runtime enforcement by this review.
