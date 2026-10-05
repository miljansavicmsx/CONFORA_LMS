# 08 — Security review

Authoring confirmation against the exported schemas and `validateRoleAdministrationAuditMetadata`. This is not an independent review.

1. Only `COMPLAINT_HANDLER` may be the managed target role. Confirmed by `roleAdministrationTargetRoleSchema` and EC1-T01 through EC1-T08.
2. Only `STAFF_ROLEADM` may initiate and approve grants. Confirmed by `roleGrantAuthorityRoleSchema` and EC1-T09 through EC1-T12.
3. Only `STAFF_ROLEADM` may apply and review revocations. Confirmed by `roleRevokeAuthorityRoleSchema` and EC1-T15 through EC1-T18.
4. `COMPLAINT_HANDLER` cannot administer roles. Confirmed by EC1-T11 and EC1-T17.
5. `STAFF_DIR` cannot administer roles. The authority loops reject it as initiator, approver, actor, and reviewer.
6. `STAFF_SYSADM` cannot administer roles. The same loops reject it.
7. `STAFF_AUD` cannot administer roles. Confirmed explicitly for revoke review by EC1-T18 and by the authority loops.
8. Committee roles cannot administer roles. `COM_APP` and `COM_CERT` are rejected as targets. Every canonical role other than `STAFF_ROLEADM` is rejected as initiator, approver, actor, and reviewer.
9. Grant initiator and approver are different actors. Confirmed by EC1-T13 and EC1-T36.
10. Revoke actor and reviewer are different actors. Confirmed by EC1-T19 and EC1-T24.
11. Self-assignment and self-revocation fail. Confirmed by EC1-T14 and EC1-T20.
12. Cross-tenant actions fail. Confirmed by EC1-T21 and EC1-T22. One canonical `tenantId` binds every party. A conflicting tenant field fails validation.
13. PKG-00 audit metadata cannot be null. Confirmed by EC1-T25 for all ten events through `validateRoleAdministrationAuditMetadata`.
14. Mandatory audit metadata cannot be omitted. Confirmed by EC1-T26 through EC1-T31. Envelope tenant is not accepted in place of `metadata.tenantId`.
15. Forbidden sensitive metadata remains rejected. Confirmed by EC1-T32.
16. No endpoint or external side effect is introduced. The diff is limited to the role-administration module, the audit registry, their tests, and this evidence directory.

```text
SECURITY_PRIVACY_RESULT = PASS
LOCAL_DATABASE_ROLE_AUTHORITY = false
AUDIT_ROWS_EMITTED = false
```

Limitation, stated so it is not over-claimed: `audit.service.ts` still calls the generic allowlist validator. That file was outside the authorized edit set. The PKG-00 enforcement point added here is `validateRoleAdministrationAuditMetadata`.
