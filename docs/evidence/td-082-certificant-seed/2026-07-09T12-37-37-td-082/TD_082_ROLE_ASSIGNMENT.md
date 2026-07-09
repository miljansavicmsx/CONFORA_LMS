# TD-082 Role Assignment

## Status: PASS (pre-existing + verified)

`pilot.learner2@confora.test` receives `USR_CERT` via `scripts/ops/seed-pilot-auth-users.ts`:

- `userRole.upsert` on `(userId, roleId)` — no duplicate on rerun
- Tenant-scoped: `tenantId = 00000000-0000-4000-8000-000000000001`
- Keycloak pilot setup mirrors JWT `realm_access.roles`

TD-082 does **not** add staff/admin roles or cross-tenant privileges.

`pilot.learner@confora.test` remains `USR_CAND` only — used as negative wallet scope in e2e tests.
