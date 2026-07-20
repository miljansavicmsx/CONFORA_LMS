# CONFORA-REPO-HEALTH-10 — W2B source inventory

Untracked candidates only (W2A manifests already tracked).

## `packages/shared-types/src/**` (untracked)

| Path | Bytes | Role |
|------|------:|------|
| `packages/shared-types/src/auth.ts` | 9146 | Zod auth/JWT/MFA/token **schemas** + `ROUTE_PERMISSIONS` + MFA role lists |
| `packages/shared-types/src/roles.ts` | 485 | `rbacRoleSchema` / `RbacRole` enum |
| `packages/shared-types/src/index.ts` | 469 | Health schema + re-exports |
| `packages/shared-types/src/health.test.ts` | 363 | Health unit test |

Already tracked (not in W2B add): `auth.mfa.spec.ts`, package.json, tsconfigs.

## `packages/shared-kernel/**` (untracked)

| Path | Bytes | Role |
|------|------:|------|
| `packages/shared-kernel/src/tenant.ts` | 1771 | `TenantId` brand, default/test tenant UUIDs, claim parsing |
| `packages/shared-kernel/src/tenant.test.ts` | 1222 | Tenant unit tests |
| `packages/shared-kernel/src/audit-context.ts` | 151 | `AuditActorContext` interface |
| `packages/shared-kernel/src/entities.ts` | 269 | `BaseEntity` / `TenantEntity` |
| `packages/shared-kernel/src/index.ts` | 321 | Barrel exports |
| `packages/shared-kernel/README.md` | — | Package readme |

**W2B candidate count: 10**
