# 02 — Known EC1 wiring gap

The EC1 commit implemented `validateRoleAdministrationAuditMetadata` in `apps/api/src/audit/audit-event.registry.ts` and covered it with standalone contract tests. That function was not called by the production append path.

Before EC2, the only production metadata check inside `AuditService.appendWithin` was `validateMetadataForEvent`. For a non-null schema that function returns `null` when metadata is `null` or `undefined`, and it does not require the PKG-00 keys. The first persistence method after that check is `AuditPersistenceApi.findEventByIdempotency`, followed by chain-head reads and `createEvent`.

Callers of `validateRoleAdministrationAuditMetadata` before EC2:

- `apps/api/src/audit/md05-pkg00-role-audit-contract.spec.ts`

Callers of `validateMetadataForEvent` before EC2:

- `apps/api/src/audit/audit.service.ts`
- `apps/api/src/audit/audit-event.registry.ts` (inside the semantic validator)
- `apps/api/src/audit/audit-validators.spec.ts`
- `apps/api/src/audit/md05-pkg00-role-audit-contract.spec.ts`

The production write used by the audit service is `AuditPersistenceApi.createEvent` in `appendWithin`. `AuditRepository.createEvent` is the repository implementation of that method.

```text
EC1_PRODUCTION_WIRING_GAP_PRESERVED = true
EC1_REVIEW_RESULT = NOT_PERFORMED
EC1_REVIEW_AUTHORIZATION = WITHDRAWN_NOT_CONSUMED
```

EC2 does not rewrite the EC1 package or claim that an independent reviewer closed the gap. The gap remains the historical fact that `939472decb2002045d5f20bc3c894e7f34919afe` did not wire the validator.
