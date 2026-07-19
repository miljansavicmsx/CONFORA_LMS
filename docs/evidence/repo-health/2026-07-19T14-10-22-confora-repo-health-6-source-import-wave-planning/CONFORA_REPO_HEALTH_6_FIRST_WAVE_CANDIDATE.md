# CONFORA-REPO-HEALTH-6 — First wave candidate

## Recommendation

**First safe import wave after RH6 review:** `W1_APP_AND_COMPOSE_CONFIG_MANIFESTS`

## Why first

- Unblocks monorepo identity for API/FE packages already referenced by workspace meta
- Small (~20 explicit files)
- No domain business logic
- No auth/JWT/MFA source
- No evidence binaries
- Aligns with dependency order: config before source

## Explicit path list (proposed for a future tracking task)

```
.cursorignore
docker-compose.yml
docker-compose.a11y-ci.yml
apps/api/package.json
apps/api/nest-cli.json
apps/api/tsconfig.json
apps/api/tsconfig.build.json
apps/api/jest.config.cjs
apps/api/jest-e2e.config.cjs
apps/api/jest.compliance.config.cjs
apps/api/jest.integration.config.cjs
frontend-app/package.json
frontend-app/tsconfig.json
frontend-app/tsconfig.app.json
frontend-app/tsconfig.node.json
frontend-app/vite.config.ts
frontend-app/index.html
frontend-app/postcss.config.js
frontend-app/tailwind.config.js
frontend-app/.env.example
```

## Pre-add checks (future task)

1. Open `frontend-app/.env.example` — confirm placeholders only
2. Confirm no secrets in compose files
3. `git add` **only** the listed paths (not directories wholesale if extras appear)
4. Commit message focus: why (reproducible package/tooling manifests)

## Out of first wave

- Any `apps/api/src/**`
- Any `frontend-app/src/**`
- `scripts/ops/**`
- `docs/evidence/**`
- `packages/**` (start in W2)
- Root `.docx` / `.pdf` planning packs
- `backend/**`
