# Independent Review — R0-3 Deployment Safety Containment

**Reviewer role:** Independent security / CI-CD / repository-governance / change-control reviewer (did not implement the change)
**Review date (UTC):** 2026-07-26
**Review mode:** Read-only; no repository, PR, GitHub settings, or workflow changes were made during the review.

## Review target

| Item | Value |
|------|-------|
| Repository | `miljansavicmsx/CONFORA_LMS` |
| Pull request | #1 (Draft, OPEN, not merged at review time) |
| Base branch | `fix/ca-h01-frontend-f4-cutover` |
| Head branch | `governance/r0-3-deploy-containment` |
| Base commit | `e27cdc0501bbd9f931d0e71f653ffc5f0d88d1bb` |
| Head commit reviewed | `006ea226efdae5ff1c1469c8985a2ab1e30b66d6` |

## Final verdict

**GO WITH CONDITIONS**

Containment is effective. Remaining conditions are explicit, bounded, and non-deployment-enabling (see §8–§10 and `OWNER_DECISIONS.md`).

## 1. Review scope

Assess whether R0-3 safely contains the production backend deployment path without unrelated changes, architectural redirection, or false claims of deployment safety. Evidence was validated independently against git history, workflow YAML at both commits, the other seven tracked workflows, and live GitHub Environment API state — not only against the implementer's summaries.

## 2. Evidence inspected

- PR #1 metadata, commit list, and changed-file list via authenticated GitHub API
- Commit range `e27cdc05..006ea226` (`git log`, `git diff --name-status`)
- `deploy-backend.yml` at base and head commits (`git show`)
- All 8 tracked workflows under `.github/workflows/` (trigger and deploy-keyword scan)
- Evidence pack in this folder (README, VALIDATION, ROLLBACK, BEFORE_AFTER_BEHAVIOUR, WORKFLOW_INVENTORY_AND_TRIGGERS, GITHUB_ENVIRONMENT_VERIFICATION.md/json, summary.json, before/after YAML copies)
- Live GitHub Environment `production` API state (protection rules, branch policies, workflow runs, deployments)
- Tracked `backend/` file count (`git ls-files -- backend` → 0)

## 3. Commit and changed-file verification — PASS

Commits in PR #1 (3):

| SHA | Message |
|-----|---------|
| `d75aaaac` | `ci(security): contain production backend deployment` |
| `92f87970` | `docs(repo): add r0-3 post-commit report` |
| `006ea226` | `docs(repo): add production environment gate evidence` |

Changed paths: exactly one operational file (`.github/workflows/deploy-backend.yml`, modified) plus additions confined to this R0-3 evidence folder. No application code, schemas, migrations, packages, frontend source, backend source, other workflows, runtime configuration, Cursor rules, or governance documents outside the evidence folder were modified. No unrelated changes present.

Minor evidence inconsistency: `summary.json` `changed_files` listed only the workflow file, while the PR also adds the evidence pack. Material containment claims remain accurate.

## 4. Workflow security analysis

### Trigger containment — PASS

- Push to `main` trigger removed (confirmed against base commit)
- Tag trigger `v*.*.*` removed
- Only `workflow_dispatch` remains
- No `schedule`, `workflow_call`, or `repository_dispatch` on this workflow
- No other workflow references or chains into `deploy-backend.yml`

### Manual authorization — PASS (with note)

- Confirmation input must equal exactly `DEPLOY_PRODUCTION`; fail-closed shell check
- `deploy_reason` is `required: true` with an additional non-empty whitespace check
- Job declares `environment: production`; GitHub holds the job until environment protection passes, before any steps (including AWS credential configuration) run
- Note: AWS credentials are repository-scoped secrets, not environment-scoped secrets. Protection still blocks job start; residual risk only if a future change removes `environment:` while repository secrets remain.

### Tracked-source preflight — PASS

Fail-closed when: `backend/` missing; `git ls-files -- backend` count is 0 (current state: 0); required files (`requirements.txt`, `lambda_handler.py`, `main.py`, `config.py`) missing or untracked. No silent redirect to NestJS / `apps/api` (mentioned only in prohibition comments). Bounded gap: `routers/` and `services/` are not explicitly asserted tracked; a clean Actions checkout only contains tracked files, and missing directories fail at the bundle step.

### Deployment target and architecture — PASS

Lambda target (`confora-lms-api` default, smoke `api.confora.io`) unchanged. No canonical backend selected. OQ-3 remains unresolved. Production deployment remains blocked until a tracked, reproducible backend source is approved and environment/branch policy permits a run.

## 5. GitHub Environment analysis (independent live API re-check)

| Check | Result |
|-------|--------|
| Environment `production` exists | VERIFIED (created 2026-07-26T10:48:53Z) |
| Required reviewers | VERIFIED — count 1 (type User) |
| `prevent_self_review` | VERIFIED — `true` |
| Custom deployment branch policies | VERIFIED — `custom_branch_policies: true`, `protected_branches: false` |
| Named allowlist entries | VERIFIED empty — `total_count: 0` → fail-closed / deny-all in selected-branch mode |
| Documented as temporary deny-all pending OQ-3 | PARTIALLY at review time (formalized post-review in `OWNER_DECISIONS.md` OD-R03-2) |
| `can_admins_bypass` | VERIFIED `true` — residual admin bypass |
| Deploy-backend workflow runs | VERIFIED `total_count: 0` |
| Production environment deployments | VERIFIED zero |

Evidence VERIFIED labels were found supported; the PARTIALLY VERIFIED classification of the empty allowlist is accurate. No reviewer identity details, secrets, tokens, or environment secret values are recorded here.

## 6. Findings (severity classified)

### CRITICAL

None. Automatic production deploy via this workflow is no longer possible; untracked `backend/` cannot complete this deploy path.

### HIGH

1. **`can_admins_bypass: true`** — repository admins can bypass environment required-reviewer protection. Acceptable only with explicit owner acceptance / compensating control. → OD-R03-1, `RISK_ACCEPTANCE.md` RA-R03-1
2. **Rollback restores unsafe auto-deploy** — reverting `deploy-backend.yml` re-arms push/`main` + tag deploys. Documented in `ROLLBACK.md` with warnings; remains a high operational hazard if rollback is used casually.

### MEDIUM

3. **Empty custom branch allowlist** — currently deny-all (good for containment) but was not, at review time, registered as an intentional standing control with exit criteria. → OD-R03-2
4. **AWS credentials are repository secrets, not environment secrets** — protection depends on the job retaining `environment: production`.
5. **No live `workflow_dispatch` proof** that environment approval + preflight ordering was exercised end-to-end (zero runs by design; residual test gap).
6. **Other CI workflows still reference untracked paths** — deferred to R0-7; not production Lambda deploy. → OD-R03-4

### LOW

7. Preflight does not explicitly require tracked `routers/` / `services/`.
8. Evidence `after/deploy-backend.yml` vs head differs only in Unicode comment encoding (em dash); YAML behaviour identical.
9. `summary.json` understated the PR file set; README branch metadata named the integration base, not the feature branch.

### OBSERVATION

10. Integration base is `fix/ca-h01-frontend-f4-cutover`, not `main` — unusual but consistent with repository state; does not weaken this containment.
11. PyYAML `on:` key quirk can mis-parse triggers under naive loading; the implementer's keyed checks were adequate but the method is fragile.
12. `actionlint` was not run — syntax validated via PyYAML parse only.

## 7. Acceptance-criteria table

| Criterion | Result |
|-----------|--------|
| Auto-deploy on push to `main` removed | MET |
| Auto-deploy on version tags removed | MET |
| `workflow_dispatch` only | MET |
| Confirm = `DEPLOY_PRODUCTION` + required reason | MET |
| Job uses Environment `production` | MET |
| Required reviewer configured (≥1) | MET |
| `prevent_self_review` enabled | MET |
| Fail-closed on untracked / missing `backend/` | MET |
| No redirect to Nest / `apps/api` | MET |
| No app/schema/migration/runtime changes | MET |
| Scope limited to workflow + R0-3 evidence | MET |
| Rollback documented with unsafe-restore warning | MET |
| Evidence materially accurate | MET (minor metadata/encoding nits) |
| Empty branch allowlist registered as temporary deny-all pending OQ-3 | PARTIAL at review time (closed by OD-R03-2) |
| Admin bypass accepted as a control decision | NOT MET at review time (addressed by OD-R03-1 / RA-R03-1) |
| Production deploy proven via successful gated run | N/A / NOT DONE (correctly zero runs) |

## 8. Residual risks

- Administrator environment bypass (`can_admins_bypass: true`)
- Rollback re-arming automatic deploy
- Empty allowlist ambiguity after OQ-3 (blocks legitimate runs until populated)
- Repository-scoped AWS secrets vs environment binding
- Untracked `backend/` still present locally (blocked from this pipeline, not removed)
- Stale CI workflows (R0-7)
- No production deployment dry-run under the new gates
- Unusual integration base branch (process risk, not a failure of this control)

## 9. Required corrective actions

1. Owner formally accept or disable `can_admins_bypass` (→ OD-R03-1)
2. Register the intended deployment branch/tag allowlist, or explicitly register the empty allowlist as temporary deny-all with exit criteria (→ OD-R03-2)
3. Prefer moving deploy credentials to environment-scoped secrets for `production` (follow-up hardening; not required to merge containment)
4. Convert Draft → Ready only after this review is recorded; merge as containment only (→ OD-R03-5)
5. Do not roll back without Security/Release acceptance and a tracked `backend/`

## 10. Required owner decisions

| ID | Decision |
|----|----------|
| OD-R03-1 | Accept residual `can_admins_bypass: true`, or set to `false` |
| OD-R03-2 | Intended production deployment branches/tags (or keep deny-all until OQ-3) |
| OD-R03-3 | Confirm OQ-3 remains open; no implied backend canonicalization |
| OD-R03-4 | Confirm R0-7 remains the path for non-deploy CI untracked-path repair |
| OD-R03-5 | Approve merge of PR #1 as containment only, not production readiness |

Owner responses are recorded in `OWNER_DECISIONS.md`.

## 11. Merge recommendation

Recommend merge after converting from Draft, as a **deployment-safety containment control**, subject to the recorded conditions. Merge must not be interpreted as production readiness, OQ-3 closure, accreditation/security-delegate/DPO approval, or permission to auto-deploy. Do not merge if the intent is to claim full R0-3 closure without OD-R03-1 / OD-R03-2.

## 12. Verdict rationale

- **Not GO:** material residual conditions remained at review time (admin bypass acceptance, allowlist registration).
- **Not NO-GO:** automatic deploy and untracked-to-production via this workflow are contained; the Environment gate is present and active; evidence is not materially false; unrelated or architectural changes are absent.
- **GO WITH CONDITIONS:** the containment is effective, and every remaining condition is explicit, bounded, and does not enable deployment.
