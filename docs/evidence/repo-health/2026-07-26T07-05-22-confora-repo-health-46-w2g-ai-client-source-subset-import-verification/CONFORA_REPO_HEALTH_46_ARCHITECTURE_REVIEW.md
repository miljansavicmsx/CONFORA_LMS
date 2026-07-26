# CONFORA REPO HEALTH 46 — Architecture Review

## Manifest / lockfile / workspace impact of import

| Change | Introduced by `f2270fdf`? |
|--------|:------------------------:|
| Root `package.json` | **no** |
| `pnpm-lock.yaml` | **no** |
| `pnpm-workspace.yaml` | **no** |
| `apps/api` source / runtime integration | **no** |
| DB / migration | **no** |
| Auth / RBAC / tenant | **no** |
| Frontend | **no** |

`requires_package_json_change: false` · `requires_lockfile_change: false` · `requires_workspace_change: false`  
`requires_apps_api_integration: false` · `requires_database_or_migration_change: false` · `requires_auth_rbac_change: false`

## Existing references (pre-import inconsistency reduced)

Tracked manifests already referenced `@confora/ai-client` before the source existed:

- `apps/api/package.json:24` — `"@confora/ai-client": "workspace:*"`
- `apps/api/jest.config.cjs`, `jest-e2e.config.cjs`, `jest.compliance.config.cjs`, `jest.integration.config.cjs` — moduleNameMapper → `packages/ai-client/src/index.ts`
- `pnpm-lock.yaml` — importer entry for `@confora/ai-client`

Importing the 5-file subset **reduces** that inconsistency (tracked manifests now resolve to tracked source) without requiring further manifest edits.

## Relationship to `packages/ai-prompts`

| Question | Answer |
|----------|--------|
| Imports `ai-prompts`? | **no** |
| Duplicates prompt logic? | **no** |
| Weakens fail-closed loader? | **no** |

Purpose-set divergence (10 `AiPurpose` values vs 5 closed prompt IDs) remains a documented RH42/RH45 deferred item for the gateway wave. Import does not widen it.

## RH43 status

Canonical `apps/api` AI source remains absent (RH43A). RH43 rework remains **blocked** until that source is imported/restored through separate evidence.

`rh43_apps_api_rework_still_blocked: true`  
`packages_ai_client_should_remain_imported: true`  
`packages_ai_client_revert_required: false`
