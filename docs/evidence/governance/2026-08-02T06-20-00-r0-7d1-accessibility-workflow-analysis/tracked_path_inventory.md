# Tracked path inventory

See `tracked_path_inventory.json` for classifications.

## Critical gaps

1. `tools/a11y/contrast-check.ts` — UNTRACKED_LOCAL_ONLY / MISSING on CI (first failure).
2. `scripts/a11y/*.mjs` — UNTRACKED_LOCAL_ONLY / MISSING on CI.
3. `tests/e2e/**` — UNTRACKED_LOCAL_ONLY (0 tracked).
4. `frontend-app/package-lock.json` — UNTRACKED_LOCAL_ONLY — `npm ci` not deterministic on CI.
5. `apps/web`, `apps/admin` — MISSING from tracking.
6. FastAPI `backend/` + compose fastapi — LEGACY_EXCLUDED for frontend-app-only target.

## Inference

Root install succeeds; real accessibility execution never starts because required
scripts and the e2e tree are not tracked.
