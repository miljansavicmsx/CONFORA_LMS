# GitHub Environment verification — `production`

**Evidence package:** `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/`  
**Verified at (UTC):** 2026-07-26T11:02:00Z (approx.; API query during R0-3 evidence update)  
**Repository:** `miljansavicmsx/CONFORA_LMS`  
**PR under review:** #1 (Draft)  
**Head commit at verification:** `92f8797022fd06eb513c9b6fefac182cf19e981a`

## Method

Authenticated GitHub REST API via `gh api`:

- `GET /repos/.../environments`
- `GET /repos/.../environments/production`
- `GET /repos/.../environments/production/deployment-branch-policies`
- `GET /repos/.../actions/workflows/{deploy-backend-id}/runs`
- `GET /repos/.../deployments?environment=production`
- `gh pr view 1`
- Local read of `.github/workflows/deploy-backend.yml` (no modification)

No environment secrets, tokens, or reviewer email addresses are recorded in this evidence.

## Classification legend

| Label | Meaning |
|-------|---------|
| **VERIFIED** | Confirmed by API or file content in this pass |
| **PARTIALLY VERIFIED** | Present but incomplete or ambiguous |
| **NOT VERIFIED** | Checked; not configured or not true |
| **NOT AVAILABLE THROUGH API** | Cannot be confirmed from available endpoints in this pass |

## Results

| # | Check | Result | Evidence (non-sensitive) |
|---|-------|--------|---------------------------|
| 1 | Environment `production` exists | **VERIFIED** | `total_count=1`; name `production`; created `2026-07-26T10:48:53Z` |
| 2 | Deployment protection rules configured | **VERIFIED** | Two rules: `branch_policy`, `required_reviewers` |
| 3 | At least one required reviewer | **VERIFIED** | Required-reviewer count = **1** (type: User) |
| 4 | Self-review prevention enabled | **VERIFIED** | `prevent_self_review: true` on required_reviewers rule |
| 5 | Deployment branch / tag policy | **PARTIALLY VERIFIED** | API reports `custom_branch_policies: true`, `protected_branches: false`. Named branch-policy list via deployment-branch-policies endpoint: **`total_count: 0`**. Interpretation: selected-branch mode is on, but **no named branch entries** were returned — allowlist is empty at API time (fail-closed for named-branch matching until entries are added). Exact intended branch names are therefore **not** confirmed. |
| 6 | Draft PR #1 open and unmerged | **VERIFIED** | `isDraft: true`, `state: OPEN`, `mergedAt: null`, `headRefOid: 92f87970…` |
| 7 | Workflow references `environment: production` | **VERIFIED** | `.github/workflows/deploy-backend.yml` lines 56–58: `environment.name: production` |
| 8 | No production deployment triggered | **VERIFIED** | Deploy backend (Lambda) workflow runs: **`total_count: 0`**. Deployments with `environment=production`: **0**. |

## Additional findings (not in the eight required checks)

| Finding | Classification | Note |
|---------|----------------|------|
| Wait timer | **NOT VERIFIED** | No wait-timer protection rule present in API payload |
| Admin bypass of gates | **VERIFIED** (setting present) | `can_admins_bypass: true` — repository admins can bypass environment protection; residual governance risk |
| Environment secrets contents | **NOT AVAILABLE THROUGH API** | Secret *values* are never returned; not inspected |

## Distinction vs prior checklist

`GITHUB_ENVIRONMENT_CHECKLIST.md` was operator guidance written **before** UI configuration. This file records **post-configuration API verification**. Checklist item “required reviewers” is now **VERIFIED**. Named deployment-branch allowlist entries remain **PARTIALLY VERIFIED** (mode on, list empty).

## Closure implication for R0-3 external condition

The external condition “configure GitHub Environment `production` with required reviewers” is **satisfied** for API-verifiable required-reviewer protection and self-review prevention.

R0-3 is **not** marked fully closed by this evidence alone. Remaining gates:

1. Independent reviewer **GO** on Draft PR #1  
2. Decide and document intended deployment-branch allowlist (currently empty custom list)  
3. Optionally disable or justify `can_admins_bypass`  
4. Broader programme items (R0-7 CI path hygiene; OQ-3 `backend/` tracking) remain outside this verification  

## Sensitive data

Not included: tokens, environment secret values, reviewer emails, private account fields beyond public GitHub login presence implied by reviewer count.
