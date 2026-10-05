# 05 — Production append enforcement

`AuditService.append` remains the production entry point. Validation is inside `appendWithin`, which is the function that later calls `createEvent`.

For these event codes the helper `isRoleAdministrationAuditEvent` selects the PKG-00 path:

- ROLE_GRANT_REQUESTED
- ROLE_GRANT_APPROVED
- ROLE_GRANT_APPLIED
- ROLE_GRANT_REJECTED
- ROLE_GRANT_FAILED
- ROLE_REVOKE_REQUESTED
- ROLE_REVOKE_APPLIED
- ROLE_REVOKE_REVIEWED
- ROLE_REVOKE_REJECTED
- ROLE_REVOKE_FAILED

Order for those codes:

1. `validateMetadataForEvent` applies the registered allowlist, unknown-key rejection, sensitive-key scan, and size limit.
2. `validateRoleAdministrationAuditMetadata` receives the event code and the supplied metadata. Null metadata throws `AUDIT_METADATA_INVALID` before a write.
3. The returned `tenantId` must equal the authenticated actor tenant. A mismatch throws `AUDIT_METADATA_INVALID` with the message `Role audit metadata tenant does not match the actor tenant.` The message does not include either tenant identifier.
4. For `ROLE_REVOKE_APPLIED`, `isRevokePostReviewDuePeriod` requires `reviewDueAt - occurredAt` to equal 86400000 milliseconds. Any other interval throws `AUDIT_METADATA_INVALID` with a PT24H message.

The semantic validator still rejects incomplete metadata, a target role other than `COMPLAINT_HANDLER`, an authority role other than `STAFF_ROLEADM`, identical grant initiator and approver, identical revoke actor and reviewer, self-assignment, self-revocation, and forbidden sensitive keys. EC2 calls that function. It does not replace it and does not skip the generic allowlist.

Events outside the ten codes return the allowlisted metadata and do not enter the role-administration validator. Unknown event codes still fail at `AuditEventRegistry.get` with `AUDIT_EVENT_NOT_REGISTERED` before persistence.

No controller, grant or revoke operation, IdP call, Prisma schema change, migration, frontend change, or new endpoint was added.
