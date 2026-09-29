# Adopted decision reproduced by this clean reissuance

RECORD_UTC = 2026-09-29T19:58:02Z

The Repository Owner selected alternative A. The design package ZIP SHA-256
`fcc012bf7ff6b2c86fe0b3fd6d41ec6cf3ff733de227c18a26c350fa4f9afad2` was
recomputed before this record.

Adopted facts:

- Canonical architecture is separate appeals and complaints modules.
- Backend ownership, when later authorized, is `apps/api/src/cert-appeals/` and `apps/api/src/cert-complaints/`.
- MD05 remains a single Model D item.
- The additional-path boundary remains pending a governance freeze.
- Scope expansion is not adopted.
- Implementation is not authorized.
- Legacy `/v1` alias routing is not canonical.
- Commit `a277a19` is not implementation authority.
- An appeal resolution committee id is required.
- An empty user id is not allowed on an authenticated case.
- Case audit events must be immutable.
- Tenant isolation is required.
- The original certification decision-maker may not approve the appeal.
- Administrator is not a case decision role.
- Auditor is not a case mutation role.
- The detailed RBAC and segregation-of-duties matrix remains pending a governance freeze.
- Model D remains `17/9/8/8/0` with mutation count 0.
- MD05 status remains `UNRESOLVED_ARCHITECTURE_SELECTED_PENDING_SCOPE_FREEZE`.
- General C3-S9 resume, R0-7E, and deployment remain unauthorized.
- CI green is not claimed, and no CI failure waiver is granted.
- Pull request #41 remains a historical non-authoritative design note and is not to be merged.

This reproduction does not add paths to the prospective eight-path freeze.
MD05 PRIMARY_PATH remains `frontend-app/src/lib/api-grievances.ts`.
MD05 ADDITIONAL_PATHS remains none.
