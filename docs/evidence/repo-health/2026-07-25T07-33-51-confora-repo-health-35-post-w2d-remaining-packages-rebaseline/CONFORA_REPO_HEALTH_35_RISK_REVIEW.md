# CONFORA-REPO-HEALTH-35 — Risk Review

Per remaining package / candidate subset.

| Package | Tenant/RBAC/SoD | Auth/security | DB/migration | Network/provider | Secrets/env | PII/tenant data | Workflow boundary | Generated/vendor | package/lock/workspace |
|---------|-----------------|---------------|--------------|------------------|-------------|-----------------|-------------------|------------------|------------------------|
| `i18n` | Low (copy only) | Low | None | None in package | None | Locale strings only; scan in RH36 | Copy must not conflate žalba/prigovor etc. | `dist` on disk untracked noise | Already tracked — audit needs **no** change |
| `ai-prompts` | Low | Low | None | fs load at module init | None | Prompt text | **High** (question.generate, risk.suggest) | `dist` | Import needs package.json |
| `ai-client` | Medium (token passthrough) | **High** (Bearer + fetch) | None | **High** (gateway HTTP) | Token via callback | Request metadata | **High** (cert-relevant purposes) | **Compiled JS in src/** | Import needs package.json; strip build artifacts |
| `database` | **High** (RLS/tenant) | Medium | **Critical** | DB URL | `.env.example` | Schema encodes PII/cert | Lifecycle models present | Prisma client | Large import |
| README stubs (`ai-governance`, `audit`, `auth`, `types`) | Intent only | Intent only | None | None | None | None | Intent only | None | No real package |

## Blocking for “next import”

- Do **not** pick `database` or README stubs.
- Do **not** import `ai-client` compiled artifacts.
- Prefer **integrity of already-tracked `i18n`** before any new AI package import.

`pii_tenant_blocking_findings: 0` (rebaseline; no blocking finding that prevents RH36 i18n audit)  
`workflow_boundary_blocking_findings: 0` (same; content scan deferred to RH36)  
`external_network_or_provider_risk: false` for recommended wave (`i18n`)  
`requires_package_json_change: false` · `requires_lockfile_change: false` · `requires_workspace_change: false` · `requires_database_or_migration_change: false` · `requires_auth_rbac_change: false`
