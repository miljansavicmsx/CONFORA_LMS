# CONFORA-REPO-HEALTH-11 — W2B commit scope

| Field | Value |
|-------|-------|
| Commit | `2aca37c` |
| Message | `chore(repo): add shared types and tenant kernel contracts` |
| Branch HEAD | `2aca37c` |
| Remote contains commit | **yes** (`origin/fix/ca-h01-frontend-f4-cutover` @ `2aca37c`) |
| File count | **10** |
| Match to RH10 list | **exact** |
| Missing / unexpected | none |

## Files in commit

1. `packages/shared-types/src/auth.ts`
2. `packages/shared-types/src/roles.ts`
3. `packages/shared-types/src/index.ts`
4. `packages/shared-types/src/health.test.ts`
5. `packages/shared-kernel/src/tenant.ts`
6. `packages/shared-kernel/src/tenant.test.ts`
7. `packages/shared-kernel/src/audit-context.ts`
8. `packages/shared-kernel/src/entities.ts`
9. `packages/shared-kernel/src/index.ts`
10. `packages/shared-kernel/README.md`

## Exclusions confirmed (not in W2B)

| Path class | In W2B? |
|------------|:-------:|
| `packages/database/**` | no |
| `packages/auth/**` | no |
| `packages/ai-*/**` | no |
| `apps/api/src/**` | no |
| `frontend-app/src/**` | no |
| `scripts/ops/**` | no |
| `docs/evidence/**` | no |

| Flag | Value |
|------|-------|
| `database_imported` | false |
| `auth_package_imported` | false |
| `ai_packages_imported` | false |
| `app_source_imported` | false |
| `frontend_source_imported` | false |
| `scripts_ops_imported` | false |
| `docs_evidence_bulk_imported` | false |
