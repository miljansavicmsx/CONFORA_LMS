# Workflow inventory

Tracked workflows under `.github/workflows/` (**8**):

| File | Name | Primary triggers | Jobs | PR #3 conclusion |
|------|------|------------------|------|------------------|
| `ci.yml` | CI | push main/master/develop; pull_request | quality, database, docker | quality FAIL; database FAIL; docker SKIPPED |
| `accessibility.yml` | Accessibility CI | push main/master; PR; dispatch; cron | compliance-iso, accessibility | both FAIL |
| `deploy-backend.yml` | Deploy backend (Lambda) | workflow_dispatch + Environment production | deploy | not triggered (R0-3) |
| `backend-tests.yml` | Backend tests | path `backend/**` | pytest | not triggered on docs PR |
| `backend-nightly.yml` | Backend tests (full) | dispatch; cron | pytest-full | N/A |
| `confora-qa.yml` | CONFORA QA | dispatch | unit-and-compliance; zap | N/A |
| `f4-frontend-cutover-gate.yml` | F4 Frontend Cutover Gate | path frontend-app/scripts | f4-frontend-cutover | not triggered on docs PR |
| `release-candidate.yml` | Release Candidate | dispatch | rc | N/A |

Branch protection on integration branch: **not configured** (API 404). No checks
are currently required by protection rules.

See `workflow_inventory.json` for structured fields.
