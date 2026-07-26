# Accessibility analysis (RC-R07-4, RC-R07-5)

## Referenced scripts

Workflow steps call:

- `node scripts/a11y/run-lighthouse.mjs`
- `node scripts/a11y/compare-baseline.mjs`
- `node scripts/a11y/aggregate-report.mjs`
- `node scripts/a11y/pr-comment.mjs`
- `node scripts/a11y/notify-failure.mjs`
- `node scripts/a11y/publish-reports.mjs`
- `node ../../scripts/record-a11y-ci-run.mjs`

Tracked count under `scripts/a11y`: **0**. Local copies exist (untracked).
PR #3 logs: `Cannot find module '.../scripts/a11y/compare-baseline.mjs'`.

Root `package.json` scripts `a11y:*` point at the same untracked paths.
`pnpm a11y:contrast` → `tsx tools/a11y/contrast-check.ts` also untracked.

## Frontend targets

Workflow mixes:

- `frontend-app` (tracked operational bridge) via Vite preview :5173
- `apps/web` / `apps/admin` (untracked local-only) via `pnpm start`
- FastAPI stack via `docker-compose.a11y-ci.yml` + `backend/` (frozen legacy)

This **incorrectly assumes** untracked Next apps and FastAPI are CI-available,
contradicting R0-1B2.1 classifications and OQ-4 / FastAPI freeze.

## Equivalent tracked scripts

No alternate tracked a11y runner set found under `git ls-files`.

## R0-7D preference

- Promote/create tracked a11y scripts under change control
- Target **frontend-app** as operational surface first
- Do not require `apps/web|admin` until OQ-4 promotion
- Do not authorize FastAPI tracking via a11y CI
