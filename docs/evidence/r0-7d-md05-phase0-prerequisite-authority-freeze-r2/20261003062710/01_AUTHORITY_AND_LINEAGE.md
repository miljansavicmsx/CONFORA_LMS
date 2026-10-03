# 01 — Authority and lineage

## Owner authorization

Token, consumed for this candidate only:

OWNER_SELECT_R0_7D_MD05_ROLE_ADMINISTRATION_OPTION_1_STAFF_ROLEADM_AND_AUTHORIZE_PHASE0_PREREQUISITE_AUTHORITY_FREEZE_R2_CLEAN_REISSUANCE

AUTHORIZATION_STATUS = CONSUMED

The token authorizes a governance and new-evidence candidate. It does not
authorize implementation, a pull request, or a merge.

## Execution identity

EXECUTION_ENGINE = CURSOR

THIS_RUN_BCID = bc-050f1554-ee78-4f54-8fb7-614c729971b5

Run URL: https://cursor.com/agents/bc-050f1554-ee78-4f54-8fb7-614c729971b5

## Frozen base

BASE_BRANCH = fix/ca-h01-frontend-f4-cutover

EXPECTED_BASE_HEAD = 72a8935d48cfaef7fe8c2273554a79aa584a1741

EXPECTED_BASE_TREE = c7d594c53bc2986eb68365a1c3e2c116c855761f

R2 is created directly from that commit. The direct parent of the R2 commit
must equal that head.

## R1 disposition

R1_BRANCH = cursor/r0-7d-md05-phase0-role-freeze-r1-71b5

R1_COMMIT = 7f6e2ba05f0abe569111a90594689519fec96304

R1 parent is the frozen base. R1 recorded a complaint-handler governance
selection and left ROLE_GRANT_AUTHORITY and ROLE_REVOKE_AUTHORITY as
NOT_NAMED.

R1 requirements applied by this package:

- R1 remains preserved;
- R1 is not rewritten;
- R1 is not deleted;
- R1 is not the R2 parent;
- R1 is not cherry-picked;
- R1 is not rebased into R2;
- R1 remains an incomplete non-authoritative attempt.

R1_ANCESTOR_OF_R2 must be false. R1 and R2 share the frozen base as a common
ancestor. R1 is a sibling attempt, not an ancestor.

## Discovery input

The preceding read-only discovery, performed against the frozen base, found:

- executable roles are the 17 members of `rbacRoleSchema`;
- `COMPLAINT_HANDLER` was not a member;
- no role-assignment or role-revocation endpoint;
- no role column on `User`;
- production audit registry size 0;
- `ROUTE_PERMISSIONS` has no consumer;
- `STAFF_SYSADM`, `STAFF_DIR`, and `STAFF_AUD` have no implemented grant or
  revoke duty.

Discovery result was AUTHORITY_OPTIONS_READY_FOR_OWNER_SELECTION. The owner
selected Option 1 and named the dedicated authority `STAFF_ROLEADM`. This
package records that selection. It does not adopt Option 2 or Option 3.

## Document level

The freeze record and the register and package updates are Level 1 candidate
records. This evidence directory is Level 7. Neither level grants
implementation authority before independent review and a later owner-authorized
integration.
