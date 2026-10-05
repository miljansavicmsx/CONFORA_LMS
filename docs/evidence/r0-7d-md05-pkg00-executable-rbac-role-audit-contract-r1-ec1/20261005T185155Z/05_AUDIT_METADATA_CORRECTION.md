# 05 — Audit metadata correction

Module: `apps/api/src/audit/audit-event.registry.ts`

The ten event identifiers are unchanged:

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

`validateRoleAdministrationAuditMetadata` is the executable PKG-00 metadata validator. For every event it rejects:

- `null` metadata;
- `undefined` metadata;
- a missing `tenantId`, `requestId`, `correlationId`, target identity, or actor identity;
- a missing `role`;
- a `role` other than `COMPLAINT_HANDLER`;
- an `actorRole` other than `STAFF_ROLEADM`;
- a forbidden sensitive metadata key.

`ROLE_GRANT_APPROVED`, `ROLE_GRANT_APPLIED`, and `ROLE_GRANT_REJECTED` require initiator and approver identities, `approverRole = STAFF_ROLEADM`, and a distinct approver.

`ROLE_REVOKE_REVIEWED` requires `reviewerUserId`, `reviewerExternalSubjectId`, `reviewerRole = STAFF_ROLEADM`, `reviewedAt`, decision `REVIEWED`, `requestId`, and `correlationId`. The reviewer must differ from `actorUserId`. `actorUserId` is the revoke actor and is not accepted as the reviewer identity.

The authenticated audit-envelope tenant is not read by this validator. `metadata.tenantId` is required on its own.

The pre-existing generic `validateMetadataForEvent` remains an allowlist helper. `audit-validators.ts` and `audit.service.ts` were outside the authorized edit set and were not modified. The PKG-00 contract tests call `validateRoleAdministrationAuditMetadata`. This package still does not emit audit rows.
