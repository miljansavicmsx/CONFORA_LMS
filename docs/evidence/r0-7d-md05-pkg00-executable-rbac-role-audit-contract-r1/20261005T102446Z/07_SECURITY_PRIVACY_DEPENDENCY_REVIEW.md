# 07 — Security, privacy, and dependency review

```text
SECURITY_PRIVACY_RESULT = PASS
DEPENDENCY_MUTATION_COUNT = 0
LOCKFILE_MUTATION_COUNT = 0
SCHEMA_MUTATION_COUNT = 0
MIGRATION_MUTATION_COUNT = 0
CONFIG_MUTATION_COUNT = 0
INFRASTRUCTURE_MUTATION_COUNT = 0
NETWORK_BEHAVIOR_INTRODUCED = false
SECRET_INTRODUCED = false
```

Install used `pnpm install --frozen-lockfile --ignore-scripts`. `pnpm-lock.yaml` is not in the diff.

Diff scan of `packages/` and `apps/` found the forbidden metadata key names `password`, `mfaSecret`, and `privateKey` only as rejection-list identifiers. No credential value, token, private key, `fetch`, HTTP client, controller, or environment secret was added.

The contract rejects self-assignment, self-revocation, same-actor grant approval, same-actor revoke review, and `STAFF_ROLEADM` self-management. Cross-tenant assignment is not an accepted shape. `reasonCode` is a bounded token rather than a free-form narrative.

`User` remains without a role column. No role-assignment table, Prisma migration, or IdP admin client was added.

`ROUTE_PERMISSIONS` does not include `COMPLAINT_HANDLER` or `STAFF_ROLEADM`.
