# 06 — Negative test matrix

Tests call exported schemas and `validateRoleAdministrationAuditMetadata`. Constant comparisons are not the acceptance criterion.

| ID      | Assertion                                                                           | Result |
| ------- | ----------------------------------------------------------------------------------- | ------ |
| EC1-T01 | Grant target `STAFF_DIR` rejected; every non-target canonical role rejected         | PASS   |
| EC1-T02 | Grant target `STAFF_SYSADM` rejected                                                | PASS   |
| EC1-T03 | Grant target `STAFF_AUD` rejected                                                   | PASS   |
| EC1-T04 | Grant targets `COM_APP` and `COM_CERT` rejected                                     | PASS   |
| EC1-T05 | Grant targets `USR_CAND` and `USR_CERT` rejected                                    | PASS   |
| EC1-T06 | Revoke target `STAFF_DIR` rejected; every non-target canonical role rejected        | PASS   |
| EC1-T07 | Target `STAFF_ROLEADM` rejected for grant and revoke                                | PASS   |
| EC1-T08 | Target `COMPLAINT_HANDLER` accepted                                                 | PASS   |
| EC1-T09 | Grant initiator `STAFF_ROLEADM` accepted                                            | PASS   |
| EC1-T10 | Grant approver `STAFF_ROLEADM` accepted                                             | PASS   |
| EC1-T11 | Grant initiator `COMPLAINT_HANDLER` rejected; other non-authority roles rejected    | PASS   |
| EC1-T12 | Grant approver `STAFF_DIR` rejected; other non-authority approver roles rejected    | PASS   |
| EC1-T13 | Identical grant initiator and approver rejected                                     | PASS   |
| EC1-T14 | Grant initiator or approver equal to the target rejected                            | PASS   |
| EC1-T15 | Revoke actor `STAFF_ROLEADM` accepted                                               | PASS   |
| EC1-T16 | Revoke reviewer `STAFF_ROLEADM` accepted and distinct                               | PASS   |
| EC1-T17 | Revoke actor `COMPLAINT_HANDLER` rejected; other non-authority actor roles rejected | PASS   |
| EC1-T18 | Revoke reviewer `STAFF_AUD` rejected; other non-authority reviewer roles rejected   | PASS   |
| EC1-T19 | Identical revoke actor and reviewer rejected                                        | PASS   |
| EC1-T20 | Revoke actor or reviewer equal to the target rejected                               | PASS   |
| EC1-T21 | Cross-tenant grant rejected                                                         | PASS   |
| EC1-T22 | Cross-tenant revoke rejected                                                        | PASS   |
| EC1-T23 | `ROLE_REVOKE_REVIEWED` requires reviewer identity                                   | PASS   |
| EC1-T24 | `ROLE_REVOKE_REVIEWED` reviewer differs from the actor                              | PASS   |
| EC1-T25 | Null and undefined metadata rejected for every PKG-00 event                         | PASS   |
| EC1-T26 | Missing `tenantId` rejected for every PKG-00 event                                  | PASS   |
| EC1-T27 | Missing `requestId` rejected for every PKG-00 event                                 | PASS   |
| EC1-T28 | Missing `correlationId` rejected for every PKG-00 event                             | PASS   |
| EC1-T29 | Missing target identity rejected for every PKG-00 event                             | PASS   |
| EC1-T30 | Missing actor identity rejected for every PKG-00 event                              | PASS   |
| EC1-T31 | Wrong target role metadata rejected for every PKG-00 event                          | PASS   |
| EC1-T32 | Forbidden sensitive metadata rejected for every PKG-00 event                        | PASS   |
| EC1-T33 | Exact ten audit events remain registered                                            | PASS   |
| EC1-T34 | Duplicate audit events remain zero                                                  | PASS   |
| EC1-T35 | `PT24H` duration is enforced by the revoke schema                                   | PASS   |
| EC1-T36 | Grant approval metadata requires a distinct approver                                | PASS   |

```text
NEGATIVE_TEST_COUNT = 36
NEGATIVE_TEST_PASS_COUNT = 36
```

EC1-T01 through EC1-T22 and EC1-T35 are in `packages/shared-types/src/md05-pkg00-rbac-role-audit.spec.ts`.

EC1-T23 through EC1-T34 and EC1-T36 are in `apps/api/src/audit/md05-pkg00-role-audit-contract.spec.ts`.
