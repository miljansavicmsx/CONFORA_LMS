# 08 — Security review

```text
VALIDATION_FAIL_CLOSED = true
INVALID_DATA_REACHES_WRITER = false
INVALID_EVENT_WRITE_COUNT = 0
```

- Invalid PKG-00 metadata throws `AuditError` inside `appendWithin` before `findEventByIdempotency` and `createEvent`. `withSerializableRetry` rethrows `AuditError` unchanged.
- EC2-T28 submits `accessToken` with a raw secret value. The rendered `AuditError` name, code, and message omit that secret and omit the key name. Console log, warn, error, and info spies captured no secret.
- Cross-tenant metadata fails against `actor.tenantId`. The error text does not contain the foreign tenant identifier. EC2-T24 and EC2-T25 assert that.
- The semantic validator accepts only `COMPLAINT_HANDLER` as the target role and only `STAFF_ROLEADM` as actor, grant approver, and revoke reviewer. `COMPLAINT_HANDLER` is not an authority role.
- Grant approval metadata requires the approver user to differ from the initiator. Revoke review metadata requires the reviewer user to differ from the actor. Actor and target must differ for every PKG-00 event.
- `validateMetadataForEvent` still runs first. EC2-T31 spies that function on a valid append and on an unknown metadata key. The unknown key is rejected with `AUDIT_METADATA_INVALID` and zero persistence calls.
- EC2-T32 spies `validateRoleAdministrationAuditMetadata` and observes one call for each of the ten events when `actorRole` is omitted. The generic allowlist permits that omission; the semantic validator rejects it before write.
- No route, controller, grant operation, revoke operation, IdP call, or external side effect was added. `audit.module.ts` was not modified.
