# 07 — Validation

Timestamp (UTC): 2026-10-03T06:27:10Z

These rows record the controls that are verifiable from the frozen base, the
branch topology before the R2 commit, and the content of this candidate.
The R2 commit SHA is not written here. Post-commit parent, tree, and remote
equality are checked immediately after the single commit and recorded in the
external execution package.

| ID | Control | Result |
|----|---------|--------|
| V01 | Remote base HEAD equals 72a8935d48cfaef7fe8c2273554a79aa584a1741 | PASS |
| V02 | Remote base tree equals c7d594c53bc2986eb68365a1c3e2c116c855761f | PASS |
| V03 | No remote drift of the frozen base before commit | PASS |
| V04 | R2 workspace started clean at the frozen base | PASS |
| V05 | R2 branch name had no local or remote collision | PASS |
| V06 | R1 commit 7f6e2ba05f0abe569111a90594689519fec96304 remains | PASS |
| V07 | R1 is not an ancestor of R2 | PASS |
| V08 | R2 direct parent equals the frozen base | PASS_BEFORE_COMMIT_HEAD_IS_BASE |
| V09 | Owner authorization recorded and consumed | PASS |
| V10 | COMPLAINT_HANDLER adopted and not implemented | PASS |
| V11 | STAFF_ROLEADM adopted and not implemented | PASS |
| V12 | External OIDC/IdP remains canonical role authority | PASS |
| V13 | No local duplicate role authority created | PASS |
| V14 | Grant authority is STAFF_ROLEADM | PASS |
| V15 | Revoke authority is STAFF_ROLEADM | PASS |
| V16 | Tenant equality required | PASS |
| V17 | Grant four-eyes required | PASS |
| V18 | Grant actors distinct | PASS |
| V19 | Self-assignment forbidden | PASS |
| V20 | Cross-tenant assignment forbidden | PASS |
| V21 | Immediate revoke permitted | PASS |
| V22 | Revoke post-review required | PASS |
| V23 | Self-revocation forbidden | PASS |
| V24 | STAFF_ROLEADM self-management forbidden | PASS |
| V25 | Auditor, director, and system administrator are not inferred authorities | PASS |
| V26 | Complaint handler cannot manage roles | PASS |
| V27 | SoD matrix complete | PASS |
| V28 | Audit-event contract complete | PASS |
| V29 | Exact governance and new-evidence scope | PASS |
| V30 | Production, test, schema, config, infra, dependency, and lockfile mutations are 0 | PASS |
| V31 | Model D unchanged at 17/9/8/8/0 | PASS |
| V32 | MD05 remains unresolved | PASS |
| V33 | Implementation remains unauthorized | PASS |
| V34 | git diff --check | PASS |
| V35 | Security, privacy, and dependency scan | PASS |
| V36 | No pull request and no merge | PASS |

VALIDATION_STEP_COUNT = 36

VALIDATION_PASS_COUNT = 36

VALIDATION_FAILURE_COUNT = 0

VALIDATION_NOT_VERIFIED_COUNT = 0

V08 is satisfied before commit because the branch head is the frozen base and
the commit is a single non-merge commit on that head. The external package
rechecks the parent after the commit exists.

V34 and V35 are executed against the candidate diff before commit. V36 is
satisfied by not creating a pull request and not merging.
