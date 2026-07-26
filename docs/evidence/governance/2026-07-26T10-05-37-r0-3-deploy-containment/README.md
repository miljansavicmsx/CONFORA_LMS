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

1. **GitHub Environment `production`:** Required reviewers — **VERIFIED** after UI configuration (see `GITHUB_ENVIRONMENT_VERIFICATION.md` / `github_environment_verification.json`). Empty named branch-policy allowlist is now recorded as an **intentional temporary deny-all control** (OD-R03-2); `can_admins_bypass=true` is a **temporarily accepted residual risk** (OD-R03-1 / RA-R03-1).  
2. **R0-7:** Other workflows (`ci.yml`, `accessibility.yml`, `backend-tests.yml`, etc.) still reference untracked paths; they do **not** deploy Lambda/production API but remain broken on fresh clone (OD-R03-4).  
3. **Deploy remains impossible today** until `backend/` is tracked (OQ-3) — by design (workflow fail-closed + empty branch allowlist; OD-R03-3).

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

## Independent review and owner decisions (addendum)

The independent review of Draft PR #1 concluded **GO WITH CONDITIONS**. Owner decisions OD-R03-1 through OD-R03-5 are recorded; the sole accepted residual risk (admin bypass, temporary) is registered with a review date.

See:

- `INDEPENDENT_REVIEW.md` — full review, severity findings, acceptance table, verdict
- `OWNER_DECISIONS.md` — OD-R03-1 … OD-R03-5 (decision, rationale, owner, date, residual risk, exit criteria)
- `RISK_ACCEPTANCE.md` — RA-R03-1 (admin bypass; temporary, expires 2026-08-26)

PR #1 remains a Draft; merging it is authorized **only** as a deployment-safety containment control (OD-R03-5).

## Claims not made

No production readiness, external pilot, DPO/legal, security-delegate, or accreditation approval is claimed. Merge of PR #1 does not close OQ-3, approve any backend as canonical, or authorize production deployment.
