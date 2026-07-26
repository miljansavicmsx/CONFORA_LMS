# R0-3 Deployment Safety Containment — Summary

**Task:** R0-3 Deployment Safety Containment  
**Evidence folder:** `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/`  
**Branch:** `fix/ca-h01-frontend-f4-cutover`  
**HEAD (pre-change base):** `e27cdc05`  
**Date:** 2026-07-26  

## Final verdict

**GO WITH CONDITIONS**

Production auto-deploy from untracked `backend/` is contained. Remaining non-deploy CI workflows still reference untracked paths; that is deferred to **R0-7 CI reconstruction** and does not re-arm production Lambda deployment.

## What changed

| File | Change |
|------|--------|
| `.github/workflows/deploy-backend.yml` | Contained — see before/after |
| Application code / schemas / migrations / runtime config | **Not modified** |
| Other 7 workflows | **Not modified** (inspected; no Lambda/prod deploy) |

## Before → After (deploy-backend.yml)

| Behaviour | Before | After |
|-----------|--------|-------|
| Trigger on push to `main` | **Yes** | **No** |
| Trigger on tags `v*.*.*` | **Yes** | **No** |
| Trigger | push + tags | **`workflow_dispatch` only** |
| Confirmation input | None | Must type `DEPLOY_PRODUCTION` |
| Deploy reason | None | Required string |
| GitHub Environment gate | None | `environment: production` |
| Untracked `backend/` deploy | Allowed (would fail mid-job or deploy stale/wrong tree) | **Fail-closed preflight** (`git ls-files -- backend` must be > 0; required files tracked) |
| Target backend | `backend/` → Lambda `confora-lms-api` → `api.confora.io` | **Unchanged** (no redirect to Nest/`apps/api`) |
| Rollback | Prior YAML in git | Prior YAML in git + `before/deploy-backend.yml` in this evidence pack |

## Conditions (explicit)

1. **GitHub Environment `production`:** Required reviewers — **VERIFIED** after UI configuration (see `GITHUB_ENVIRONMENT_VERIFICATION.md` / `github_environment_verification.json`). Remaining: empty named branch-policy allowlist (PARTIALLY VERIFIED), `can_admins_bypass=true`, independent reviewer GO.  
2. **R0-7:** Other workflows (`ci.yml`, `accessibility.yml`, `backend-tests.yml`, etc.) still reference untracked paths; they do **not** deploy Lambda/production API but remain broken on fresh clone.  
3. **Deploy remains impossible today** until `backend/` is tracked (OQ-3) — by design (workflow fail-closed + empty branch allowlist).

## Acceptance checklist

- [x] Inspected all 8 tracked workflows  
- [x] Contained `deploy-backend.yml`  
- [x] Removed automatic production deployment on push to `main`  
- [x] Required explicit manual production approval gate (dispatch + confirm string + `production` environment)  
- [x] Deploy workflow refuses untracked `backend/` paths  
- [x] Did not redirect deployment to another backend  
- [x] Did not modify application code, schemas, migrations, or runtime configuration  
- [x] Preserved rollback capability  
- [x] Evidence package produced  
- [x] GitHub Environment `production` required-reviewer gate verified via API  

## Environment verification (addendum)

See:

- `GITHUB_ENVIRONMENT_VERIFICATION.md`
- `github_environment_verification.json`

Draft PR #1 remains open for **independent review**; this evidence does not merge or mark the PR ready.

## Claims not made

No production readiness, external pilot, DPO/legal, security-delegate, or accreditation approval is claimed. R0-3 is **not** fully closed without independent reviewer GO.
