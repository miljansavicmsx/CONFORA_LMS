# CONFORA-REPO-HEALTH-7 — Next wave recommendation

## Recommended next wave

`W2_SHARED_PACKAGES`

## Why

- W1 verified: config/manifests only, controlled scope.
- Dependency order (RH6): shared packages before app source.
- Do **not** jump to broad `apps/api/src` or `frontend-app/src` import.

## W2 path group logic (reminder — not executed here)

Prefer explicit package paths, e.g.:

- `packages/shared-types/**`
- `packages/shared-kernel/**`
- `packages/config/**`
- `packages/ui/**`
- then `packages/database/**` (no secrets)
- defer `packages/auth` if secret-bearing until review

## Explicit non-actions now

- Do not import W2 in this task
- Do not `git add .`
- Do not broad-add `apps/`, `frontend-app/`, `docs/evidence/`
