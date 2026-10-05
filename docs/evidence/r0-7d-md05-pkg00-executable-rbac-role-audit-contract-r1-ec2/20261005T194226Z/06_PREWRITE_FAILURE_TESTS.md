# 06 — Pre-write failure tests

All EC2-T01 through EC2-T34 cases live in `apps/api/src/audit/md05-pkg00-production-append.spec.ts`. Each case that accepts or rejects an event calls `AuditService.append` with `AuditEventRegistry.production()`, except EC2-T29, which calls `AuditService.append` on a separate `TEST_EVENT` registry, and EC2-T33, which asserts registry identifier uniqueness. The persistence mock records `findEventByIdempotency`, `findChainHead`, `createInitialChainHead`, `createEvent`, and `advanceChainHeadCas`. Invalid cases require the sum of those calls to be 0.

```text
AUDIT_WRITE_CALL_COUNT = 0
```

| ID      | Result required                                             | Writer calls |
| ------- | ----------------------------------------------------------- | ------------ |
| EC2-T01 | valid ROLE_GRANT_REQUESTED                                  | 1            |
| EC2-T02 | valid ROLE_GRANT_APPROVED                                   | 1            |
| EC2-T03 | valid ROLE_GRANT_APPLIED                                    | 1            |
| EC2-T04 | valid ROLE_GRANT_REJECTED                                   | 1            |
| EC2-T05 | valid ROLE_GRANT_FAILED                                     | 1            |
| EC2-T06 | valid ROLE_REVOKE_REQUESTED                                 | 1            |
| EC2-T07 | valid ROLE_REVOKE_APPLIED                                   | 1            |
| EC2-T08 | valid ROLE_REVOKE_REVIEWED                                  | 1            |
| EC2-T09 | valid ROLE_REVOKE_REJECTED                                  | 1            |
| EC2-T10 | valid ROLE_REVOKE_FAILED                                    | 1            |
| EC2-T11 | null metadata                                               | 0            |
| EC2-T12 | missing tenantId                                            | 0            |
| EC2-T13 | missing requestId                                           | 0            |
| EC2-T14 | missing correlationId                                       | 0            |
| EC2-T15 | missing target identity                                     | 0            |
| EC2-T16 | missing actor identity                                      | 0            |
| EC2-T17 | wrong target role                                           | 0            |
| EC2-T18 | wrong grant authority                                       | 0            |
| EC2-T19 | wrong revoke authority                                      | 0            |
| EC2-T20 | identical grant initiator and approver                      | 0            |
| EC2-T21 | identical revoke actor and reviewer                         | 0            |
| EC2-T22 | self-assignment                                             | 0            |
| EC2-T23 | self-revocation                                             | 0            |
| EC2-T24 | cross-tenant grant                                          | 0            |
| EC2-T25 | cross-tenant revoke                                         | 0            |
| EC2-T26 | invalid PT24H deadline                                      | 0            |
| EC2-T27 | forbidden metadata                                          | 0            |
| EC2-T28 | error and console output omit the secret                    | 0            |
| EC2-T29 | TEST_EVENT note and null metadata still append              | 1 each       |
| EC2-T30 | unknown event AUDIT_EVENT_NOT_REGISTERED                    | 0            |
| EC2-T31 | generic allowlist spy runs for valid and unknown-key input  | 0 on reject  |
| EC2-T32 | semantic validator spy runs once per each of the ten events | 0            |
| EC2-T33 | ten unique identifiers; duplicate registration throws       | n/a          |
| EC2-T34 | every invalid fixture leaves the persistence mock untouched | 0            |

Jest result for this file, run with `pnpm --dir apps/api exec jest --runInBand src/audit --no-coverage` together with the rest of the audit suite: PASS. See `07_REGRESSION_RESULTS.md`.
