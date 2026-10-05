# 02 — Role model

## Adopted identifiers

| Pin | Value |
|-----|-------|
| COMPLAINT_HANDLER_ROLE | COMPLAINT_HANDLER |
| COMPLAINT_HANDLER_ROLE_ADOPTED | true |
| COMPLAINT_HANDLER_ROLE_IMPLEMENTED | false |
| ROLE_ADMINISTRATOR_ROLE | STAFF_ROLEADM |
| ROLE_ADMINISTRATOR_LABEL | RBAC Role Administrator |
| ROLE_ADMINISTRATOR_ROLE_ADOPTED | true |
| ROLE_ADMINISTRATOR_ROLE_IMPLEMENTED | false |
| ROLE_ADMINISTRATION_OPTION | OPTION_1_DEDICATED_AUTHORITY |

Adoption is a governance selection. Implementation means membership in
`packages/shared-types/src/roles.ts` `rbacRoleSchema` and server enforcement.
Both implementation pins are false. This package does not edit `roles.ts`.

## Executable role list at the frozen base

`rbacRoleSchema` contains exactly these 17 identifiers:

1. USR_CAND
2. USR_CERT
3. STAFF_DIR
4. STAFF_SYSADM
5. STAFF_TRAINADM
6. ISSUANCE_OFFICER
7. LIFECYCLE_OFFICER
8. COM_TECH
9. COM_CERT
10. COM_IMP
11. COM_APP
12. STAFF_AUD
13. SME
14. EXAMINER
15. INVIGILATOR
16. QUALITY_MANAGER
17. AI_SECURITY_MANAGER

`COMPLAINT_HANDLER` and `STAFF_ROLEADM` are absent from that list. Baseline
§6 names 15 roles and does not list `ISSUANCE_OFFICER` or
`LIFECYCLE_OFFICER`, which are present in the enum. `docs/roles.md` is
absent. Those documentation gaps are recorded. This package does not close
them.

## Canonical authority

ROLE_AUTHORITY_SOURCE = EXTERNAL_OIDC_IDP_CANONICAL

LOCAL_DATABASE_ROLE_AUTHORITY = false

JWT_ROLE_CLAIMS_REMAIN_READ_ONLY_IN_APPLICATION = true

At the frozen base, `JwtStrategy.validate` requires `tenant_id`, resolves the
user in that tenant, and copies `parseRolesFromPayload` output onto the
actor. `parseRolesFromPayload` keeps only `realm_access.roles` strings that
pass `rbacRoleSchema`. Unknown strings are dropped. `User` has `id`,
`tenantId`, `email`, and `isActive`. It has no role column. There is no
membership table.

The application must not create a second conflicting role authority inside
`User`, a tenant-membership table, or an application-local role column
without a separately authorized architecture change.

## Bootstrap

STAFF_ROLEADM_BOOTSTRAP_AUTHORITY = OWNER_CONTROLLED_EXTERNAL_IDP_ADMINISTRATION

STAFF_ROLEADM_BOOTSTRAP_IMPLEMENTATION = OUTSIDE_THIS_PACKAGE

The precise external identity-provider administration mechanism remains a
separately authorized prerequisite. This package does not claim that a
Keycloak Admin client already exists. Repository search at the frozen base
found no Keycloak Admin client in application source.

## What the labels do not grant

`STAFF_ROLEADM` does not grant complaint-case mutation.

`COMPLAINT_HANDLER` does not grant role management.

`STAFF_SYSADM` does not grant or revoke `COMPLAINT_HANDLER`.

`STAFF_DIR` does not grant or revoke `COMPLAINT_HANDLER`.

`STAFF_AUD` does not grant or revoke `COMPLAINT_HANDLER`.

Frontend predicates, including `evaluateSysAdminAccess`, remain client
visibility checks. They do not grant server authority.
