# 05 — Audit event contract

Registered on `AuditEventRegistry.production()` using the existing `AuditEventDefinition` and `MetadataSchema` allowlist. No parallel registry was added. No audit row is emitted.

```text
AUDIT_EVENT_COUNT = 10
AUDIT_METADATA_ALLOWLIST_RESULT = EXISTING_METADATA_SCHEMA_USED
RESOURCE_TYPE_POLICY = OPTIONAL
```

Event set:

1. `ROLE_GRANT_REQUESTED`
2. `ROLE_GRANT_APPROVED`
3. `ROLE_GRANT_APPLIED`
4. `ROLE_GRANT_REJECTED`
5. `ROLE_GRANT_FAILED`
6. `ROLE_REVOKE_REQUESTED`
7. `ROLE_REVOKE_APPLIED`
8. `ROLE_REVOKE_REVIEWED`
9. `ROLE_REVOKE_REJECTED`
10. `ROLE_REVOKE_FAILED`

Common allowed metadata keys on every event:

`eventId`, `occurredAt`, `tenantId`, `actorUserId`, `actorExternalSubjectId`, `targetUserId`, `targetExternalSubjectId`, `role`, `requestId`, `reasonCode`, `correlationId`, `sourceSystem`

Additional allowed keys where the event needs them:

- grant approved, applied, and rejected: `approverUserId`, `approverExternalSubjectId`, `decision`, `previousState`, `resultingState`
- grant requested and revoke requested or rejected: `decision`, `previousState`, `resultingState`
- grant failed and revoke failed: those state keys plus `errorCode`
- revoke applied: state keys plus `reviewDueAt`
- revoke reviewed: state keys plus `reviewedAt`

Forbidden keys are absent from every allowlist and are rejected by the existing unknown-key validator:

`accessToken`, `refreshToken`, `authorizationHeader`, `password`, `mfaSecret`, `privateKey`, `rawJwt`, `fullRequestBody`, `unrestrictedSensitiveNarrative`

The existing schema is an allowlist. It does not require every allowed key to be present on an append. Presence enforcement beyond that allowlist was not added, because the current registry already expresses allowlists without a redesign.
