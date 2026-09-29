# Recorded owner decision

RECORD_UTC = 2026-09-29T15:44:27Z

The Repository Owner selected alternative A from the preparation package
whose ZIP SHA-256 is
`fcc012bf7ff6b2c86fe0b3fd6d41ec6cf3ff733de227c18a26c350fa4f9afad2`.
That hash was recomputed on the package file before this record.

Adopted facts:

- Canonical architecture is separate appeals and complaints modules.
- Backend ownership, when later authorized, is `apps/api/src/cert-appeals/` and `apps/api/src/cert-complaints/`.
- MD05 remains a single Model D item.
- Legacy `/v1` alias routing is not canonical.
- `a277a19` is not implementation authority.
- An appeal resolution committee id is required.
- An empty user id is not allowed on an authenticated case.
- Case audit events must be immutable.
- Tenant isolation is required.
- The original certification decision-maker may not approve the appeal.
- Administrator is not a case decision role.
- Auditor is not a case mutation role.

Not adopted by this decision:

- MD05 additional-path expansion
- The detailed RBAC and SoD matrix
- Implementation
- General C3-S9 resume, R0-7E, or deployment
- Pull request #41

PR_41_STATUS = HISTORICAL_NONAUTHORITATIVE_DESIGN_NOTE_NOT_TO_BE_MERGED

MD05_STATUS = UNRESOLVED_ARCHITECTURE_SELECTED_PENDING_SCOPE_FREEZE
