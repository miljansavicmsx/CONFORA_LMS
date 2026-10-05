# 07 — Security, privacy, and segregation of duties

This is an authoring review. It is not an independent acceptance.

| Control            | Finding                                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication     | A null actor returns `ACTOR_NOT_AUTHENTICATED`. No HTTP route calls the service yet.                                                                                             |
| Tenant isolation   | Actor tenant must equal the command tenant. Party-tenant conflicts reuse the PKG-00 cross-tenant codes.                                                                          |
| Role authorization | `actor.roles` must include `STAFF_ROLEADM`. Metadata `initiatorRole` is not sufficient.                                                                                          |
| MFA                | `mfaVerified` must be true. The check is inside the service.                                                                                                                     |
| SoD                | Self-assignment uses the PKG-00 code. The caller must be the decision party. `COMPLAINT_HANDLER` cannot pass the gate. An accepted result does not authorize complaint mutation. |
| Audit              | No audit event is written. That matches a gate with no state change. O01, O02, and O03 are unchanged.                                                                            |
| PII                | Rejection payloads are codes only. Tests reject password, token, and email echo.                                                                                                 |
| Logs               | The service does not log.                                                                                                                                                        |
| Concurrency        | The function is pure.                                                                                                                                                            |
| Idempotency        | Repeated inputs return the same result. There is no store.                                                                                                                       |
| Transactions       | There are no writes and no partial write.                                                                                                                                        |
| State pairing      | Applied grant must be PENDING to ACTIVE. Applied revoke must be ACTIVE to REVOKED. Other decision names have matching pairs.                                                     |
| Rollback           | Nothing is stored, so there is nothing to roll back.                                                                                                                             |
| Import cycles      | The module depends on the service and shared-types only.                                                                                                                         |
| Unused exports     | Exported codes and the accepted result are used by the service or tests.                                                                                                         |
| Dead code          | No controller or adapter was added ahead of PKG-02.                                                                                                                              |
| Test quality       | Fifteen unit tests cover the required negative cases. There is no HTTP integration test because PKG-01 has no route.                                                             |

Residual risk: a later caller can ignore `roleMutationPerformed: false` and treat acceptance as a completed grant. PKG-03 remains blocked until privacy, retention, and provider custody are decided.

`privacy_basis_status` for PKG-01 is `NO_NEW_PROCESSING_ACTIVITY`. No statutory basis was invented.

Secret scan of the uncommitted API diff found no `AKIA`, private-key block, or `client_secret`.
