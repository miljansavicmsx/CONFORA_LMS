# Workflow inventory and trigger analysis

**Classification:** VERIFIED against tracked files under `.github/workflows/` at HEAD `e27cdc05` plus post-change `deploy-backend.yml`.

## Tracked workflows (8)

| Workflow | Triggers (current) | Deploys production Lambda / api.confora.io? | References untracked paths? | R0-3 action |
|----------|-------------------|--------------------------------------------|-----------------------------|-------------|
| `deploy-backend.yml` | **After:** `workflow_dispatch` only | **Yes** (contained) | `backend/**` (0 tracked today) | **Contained** |
| `ci.yml` | push `main/master/develop`, PR | No (build/test/migrate in CI; docker build) | Yes (`packages/database`, Dockerfiles, …) | Inspect only → R0-7 |
| `accessibility.yml` | push, PR, schedule, dispatch | No | Yes (`tests/e2e`, `backend/`, …) | Inspect only → R0-7 |
| `backend-tests.yml` | push/PR paths `backend/**` | No | Yes (`backend/` untracked → path filter never fires usefully) | Inspect only → R0-7 |
| `backend-nightly.yml` | schedule + dispatch | No | Yes (`backend/`, validate script) | Inspect only → R0-7 |
| `confora-qa.yml` | dispatch | No (optional ZAP) | Yes (database/worker) | Inspect only → R0-7 |
| `f4-frontend-cutover-gate.yml` | push/PR | No | Yes (ops scripts, lockfile) | Inspect only → R0-7 |
| `release-candidate.yml` | dispatch | No | Yes (`backend/`, frontend lockfile) | Inspect only → R0-7 |

## Production deploy keyword scan

Only `deploy-backend.yml` contains:

- `aws lambda update-function-code`
- default smoke base `https://api.confora.io`
- Lambda name default `confora-lms-api`

`ci.yml` / `accessibility.yml` use `prisma migrate deploy` — that is **CI database migrate**, not production Lambda API deploy. Left untouched in R0-3.

## deploy-backend.yml trigger analysis (after)

```text
on_keys= ['workflow_dispatch']
has_push= False
has_dispatch= True
job_names= ['deploy']
environment= {'name': 'production', 'url': 'https://api.confora.io'}
```

PyYAML parse: **YAML_OK**.

## Manual gate layers (defence in depth)

1. **No push/tag trigger** — cannot fire from merge to `main` alone.  
2. **`workflow_dispatch` inputs** — operator must type `DEPLOY_PRODUCTION` and supply `deploy_reason`.  
3. **`environment: production`** — GitHub Environment protection (required reviewers) when configured in repo Settings.  
4. **Tracked-path preflight** — refuses if `git ls-files -- backend` count is 0 or required files untracked.

## Local simulation (this repository state)

```text
tracked_backend_files=0
GATE_WOULD_FAIL_CLOSED=true (expected today)
```

Even a manual dispatch with correct confirmation would stop before AWS credentials / Lambda update while `backend/` remains untracked.
