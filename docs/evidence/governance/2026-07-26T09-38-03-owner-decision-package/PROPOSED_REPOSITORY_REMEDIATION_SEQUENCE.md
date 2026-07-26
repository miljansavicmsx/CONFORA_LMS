# REPOSITORY_REMEDIATION_SEQUENCE

**Proposed path:** `docs/governance/REPOSITORY_REMEDIATION_SEQUENCE.md`  
**Status:** PROPOSED — do not execute until matching OQs are signed in the Owner Decision Register  
**Based on evidence:** `2026-07-26T08-43-21-repository-rules-rebaseline`  
**HEAD at proposal:** `e27cdc05`

## Principles

1. **Small controlled tasks** — one objective, explicit allow/deny file lists.  
2. **No owner decisions implied** — each task lists required OQ signatures.  
3. **Safety before reconstruction** — R0-3 before R0-4.  
4. **Audit-only until signed** — this document does not authorize code changes by itself.  
5. **Evidence after every task** — new folder under `docs/evidence/governance/` or `docs/evidence/repo-health/`.  
6. **RH import discipline continues** — no `git add .`, no broad package dumps.

## Dependency overview

```text
OQ-6 signed ──► R0-3 Deployment safety containment
OQ-1 signed ──► R0-1 Governance corpus tracking
OQ-1 + OQ-2 ──► R0-2 Cursor rule tracking
OQ-3 (+OQ-6) ─► R0-4 Canonical backend resolution
OQ-4 signed ──► R0-5 Canonical frontend + ADR
OQ-3 + OQ-5 ──► R0-6 Identity/RBAC/SoD integration
R0-3 + R0-4… ─► R0-7 CI reconstruction
OQ-7 + R0-4 ──► R1-1 Tenant isolation
OQ-7 + R0-4 ──► R1-2 Audit redaction/integrity
(any time after R0-1) ► R1-3 Line-ending / hygiene
All R0 + required R1 + all OQs closed ► R2 Final governance rebaseline
```

---

## R0-1 — Governance corpus tracking

| Field | Content |
|-------|---------|
| **Objective** | Place the authoritative Baseline, ADRs, architecture registry and named standards under Git so `AGENTS.md` resolves on a fresh clone. |
| **Dependencies** | OQ-1 signed as A or B |
| **Allowed files** | Approved paths under `docs/governance/**`, `docs/architecture/**`, and named root standards from the Decision Register; this remediation evidence folder |
| **Prohibited changes** | Application code; CI; `.cursor/rules` (unless OQ-2 also signed); `backend/`; `packages/database`; secrets; binary root specs unless listed; rewriting historical `docs/evidence/**` |
| **Acceptance criteria** | Fresh clone contains Baseline at path cited by `AGENTS.md`; ADR index present if Option A/B requires it; import file list matches Register; no secrets in import (scan) |
| **Required tests** | Path existence check script or documented `Test-Path`/`git ls-files` evidence; optional link checker for Baseline internal refs |
| **Evidence** | `docs/evidence/governance/<ts>-r0-1-governance-corpus-import/` with file inventory + SHA-256 + scan results |
| **Rollback** | `git revert` of import commit(s); do not delete evidence |
| **GO/NO-GO** | **GO** only if OQ-1 signed and import list closed; **NO-GO** if Option C/D or unsigned |

---

## R0-2 — Cursor rule tracking

| Field | Content |
|-------|---------|
| **Objective** | Version `.cursor/rules/*.mdc` in Git; narrow `.gitignore` so rules are tracked without tracking all of `.cursor/`. |
| **Dependencies** | OQ-2 signed as A or C; OQ-1 A/B strongly preferred so rules cite tracked Baseline |
| **Allowed files** | `.gitignore` (narrow `.cursor/` exception only); `.cursor/rules/**/*.mdc`; evidence folder |
| **Prohibited changes** | Other `.cursor/` content; application code; CI; Baseline text changes (unless separate approved edit) |
| **Acceptance criteria** | `git ls-files .cursor/rules` shows expected rule files; `git check-ignore` confirms non-rule `.cursor/` still ignored; rules contain no secrets |
| **Required tests** | `git check-ignore -v` matrix for rules vs other `.cursor/` paths; secret scan on `.mdc` |
| **Evidence** | `docs/evidence/governance/<ts>-r0-2-cursor-rules-tracking/` |
| **Rollback** | Revert commit; restore previous `.gitignore` |
| **GO/NO-GO** | **GO** if OQ-2 A/C signed; **NO-GO** if B/D/unsigned |

---

## R0-3 — Deployment safety containment

| Field | Content |
|-------|---------|
| **Objective** | Eliminate latent production deployment from `deploy-backend.yml` against untracked `backend/`; establish manual gates and environment protection. |
| **Dependencies** | **OQ-6 signed as A** (recommended) or equivalent containment decision |
| **Allowed files** | `.github/workflows/deploy-backend.yml` (and only other workflows explicitly listed in Register for disable/`workflow_dispatch`); optional `docs/runbooks/**` rollback note if OQ-1 allows docs; evidence |
| **Prohibited changes** | Application code; enabling new automatic prod deploys; importing `backend/` in this task; GitHub secret values in repo files |
| **Acceptance criteria** | No workflow auto-deploys to `api.confora.io` on push without manual approval; Environment protection documented; rollback procedure linked; fresh-clone behaviour documented |
| **Required tests** | Workflow YAML review checklist; dry-run documentation; confirm path `backend/` still untracked unless OQ-3 decided otherwise |
| **Evidence** | `docs/evidence/governance/<ts>-r0-3-deploy-containment/` |
| **Rollback** | Revert workflow commit; if Environment settings changed in GitHub UI, reverse per runbook |
| **GO/NO-GO** | **GO** immediately after OQ-6 A; **NO-GO** if OQ-6 = D or unsigned. **This task is the first remediation allowed to touch CI.** |

---

## R0-4 — Canonical backend resolution

| Field | Content |
|-------|---------|
| **Objective** | Establish a buildable Nest `apps/api` path (recover or reconstruct) and apply FastAPI disposition per OQ-3 (typically freeze-tracked). |
| **Dependencies** | OQ-3 signed; R0-3 complete (safety); discovery note on Nest recoverability |
| **Allowed files** | Per Register: recovered/reconstructed `apps/api/src/**` subsets; optionally controlled FastAPI freeze import allowlist; `packages/database` **only if** separately approved as RH-gated sub-task; evidence |
| **Prohibited changes** | Silent FastAPI feature expansion; deleting FastAPI before Nest buildable; broad `git add backend/`; mixing auth SoD port (belongs in R0-6) unless explicitly in scope |
| **Acceptance criteria** | Clean clone: `@confora/api` typecheck/build succeeds **or** documented interim “thin API” build profile approved; FastAPI disposition implemented as decided; module import list no longer references missing files for the declared profile |
| **Required tests** | `pnpm --filter @confora/api` typecheck; existing tracked unit/e2e that still apply; smoke list for recovered modules |
| **Evidence** | `docs/evidence/governance/<ts>-r0-4-canonical-backend/` + recovery/reconstruction report |
| **Rollback** | Revert import commits; keep evidence; do not re-arm deploy |
| **GO/NO-GO** | **GO** if OQ-3 signed and R0-3 done; **NO-GO** if Nest strategy undefined |

---

## R0-5 — Canonical frontend and ADR resolution

| Field | Content |
|-------|---------|
| **Objective** | Resolve ADR-001 conflict; publish superseding ADR; align labels for `frontend-app` / `apps/web` / `apps/admin` / `frontend-public`. |
| **Dependencies** | OQ-4 signed; OQ-1 A/B preferred so ADR can be tracked |
| **Allowed files** | New/superseding ADR under `docs/architecture/decisions/**`; Canonical Component Registry update; optional `pnpm-workspace.yaml` if Register approves `frontend-app` membership; evidence |
| **Prohibited changes** | Large frontend rewrites; deleting `frontend-app`; switching CI to `apps/web` unless Option B chosen |
| **Acceptance criteria** | Superseding ADR Accepted and tracked (if corpus tracked); registry labels match decision; CI frontend target matches Register |
| **Required tests** | Doc consistency check (ADR vs registry vs CI workflow name); no app E2E required for ADR-only |
| **Evidence** | `docs/evidence/governance/<ts>-r0-5-frontend-adr/` |
| **Rollback** | Revert ADR/registry commits; leave prior Accepted ADR history intact |
| **GO/NO-GO** | **GO** if OQ-4 signed; **NO-GO** if D/unsigned |

---

## R0-6 — Identity / RBAC / SoD repository integration

| Field | Content |
|-------|---------|
| **Objective** | Make authoritative authZ/SoD reviewable in Git and define Nest parity gate; align IdP and role vocabulary per OQ-5. |
| **Dependencies** | OQ-5 signed; OQ-3 disposition (FastAPI freeze-tracked recommended); R0-4 in progress or complete enough for Nest auth modules |
| **Allowed files** | Per Register: FastAPI auth/SoD allowlist and/or Nest auth/SoD modules; `packages/shared-types` role mapping docs/code; future `packages/auth` contracts; tests; evidence |
| **Prohibited changes** | Weakening SoD HARD_BLOCKs; enabling Nest certification decision routes without parity gate; committing Cognito/Keycloak secrets |
| **Acceptance criteria** | Named runtime SoR documented in-repo; role mapping or single vocabulary present; SoD parity checklist exists; minimum SoD/RBAC tests tracked and runnable for the chosen SoR |
| **Required tests** | SoD negative tests (self-decision, sys_admin decide, scheme approve≠activate); RBAC deny tests; tenant mismatch on actor resolution |
| **Evidence** | `docs/evidence/governance/<ts>-r0-6-identity-rbac-sod/` |
| **Rollback** | Revert imports; do not leave Nest cert routes half-enabled |
| **GO/NO-GO** | **GO** if OQ-5 signed; **NO-GO** if SoR unnamed |

---

## R0-7 — CI reconstruction

| Field | Content |
|-------|---------|
| **Objective** | Rebuild CI so every enabled job references **tracked** paths only; re-introduce jobs as imports land. |
| **Dependencies** | R0-3 complete; partial R0-4/R0-5/R0-6 as needed for job targets |
| **Allowed files** | `.github/workflows/*.yml`; possibly `package.json` scripts that workflows call; evidence |
| **Prohibited changes** | Re-enabling auto prod deploy; referencing untracked paths; deleting husky/lint without replacement |
| **Acceptance criteria** | Fresh clone: enabled workflows pass or skip explicitly; matrix of workflow→paths all tracked; deploy requires manual gate |
| **Required tests** | Act/dry documentation; CI run on PR from clean branch; path inventory script |
| **Evidence** | `docs/evidence/governance/<ts>-r0-7-ci-reconstruction/` |
| **Rollback** | Revert workflow commits to post-R0-3 safe state |
| **GO/NO-GO** | **GO** after R0-3; full green matrix may be staged; **NO-GO** if any enabled job references untracked paths |

---

## R1-1 — Tenant-isolation bypass remediation

| Field | Content |
|-------|---------|
| **Objective** | Close or explicitly waive tracked Nest tenant bypasses; align enforcement set with schema; fail-closed context. |
| **Dependencies** | OQ-7 signed; R0-4 progressed so `tenant-prisma.util` / ALS store exist or waiver lists them |
| **Allowed files** | `apps/api/src/prisma/**`, `apps/api/src/tenant/**`, related tests; possibly `packages/database` migrations if approved; evidence |
| **Prohibited changes** | Permanent fail-open without Register waiver; disabling tenant checks globally; mixing audit redaction (R1-2) |
| **Acceptance criteria** | Fail-closed behaviour per Register; update/delete compensating control or redesign landed **or** waiver with expiry; tests cover former bypasses; 11-model gap addressed or listed |
| **Required tests** | Wrong-tenant update/delete negatives; unset-context negatives; platform-scope positives with audit |
| **Evidence** | `docs/evidence/governance/<ts>-r1-1-tenant-isolation/` |
| **Rollback** | Revert code; restore prior extension; keep tests that still apply |
| **GO/NO-GO** | **GO** if OQ-7 A/B; **NO-GO** if C/D without superseding ADR |

---

## R1-2 — Audit redaction and integrity remediation

| Field | Content |
|-------|---------|
| **Objective** | Enforce write-path PII minimization/redaction; clarify RLS-on-audit; restore or reattach Nest audit ledger source; resolve audit-client vs `packages/audit`. |
| **Dependencies** | OQ-7 signed; Nest audit source available (R0-4) or explicit interim design |
| **Allowed files** | `apps/api/src/audit/**`, `packages/audit-client/**`, optional `packages/audit/**`, database migrations for RLS if approved, tests, registry/G5 reconciliation doc |
| **Prohibited changes** | Dropping append-only triggers; logging raw secrets “temporarily”; claiming RLS if not applied |
| **Acceptance criteria** | Write-path redaction policy implemented or waived-with-date; append-only still enforced; RLS decision applied; registry/G5 conflict resolved in tracked docs; integrity test tracked |
| **Required tests** | Immutability (UPDATE/DELETE fail); chain integrity; redaction unit tests; no-secret-in-ledger fixtures |
| **Evidence** | `docs/evidence/governance/<ts>-r1-2-audit-controls/` |
| **Rollback** | Revert code/migrations carefully (migrations may need expand/contract); never rewrite historical audit rows |
| **GO/NO-GO** | **GO** if OQ-7 signed; **NO-GO** if Nest audit still missing and no interim approved |

---

## R1-3 — Line-ending and repository hygiene

| Field | Content |
|-------|---------|
| **Objective** | Eliminate CRLF phantom-dirty status; close ignore gaps for `packages/ai-client` src emit and `.terraform/`; optional generated-files manifest. |
| **Dependencies** | None hard; best after R0-1 so hygiene policy can be documented in governance |
| **Allowed files** | `.gitattributes`; root `.gitignore`; `packages/ai-client/.gitignore` (RH48B); optional `docs/GENERATED_FILES.md` if OQ-1 allows; evidence |
| **Prohibited changes** | Application logic; mass line-ending rewrites of unrelated trees without plan; deleting `.terraform` binaries without ignore first if risky |
| **Acceptance criteria** | `git status --porcelain -uno` clean of CRLF noise on evidence files (or documented); ai-client generated artifacts ignored; `.terraform/` ignored; no tracked generated artifacts |
| **Required tests** | `git check-ignore -v` for ai-client artifacts and `.terraform`; hash-identity sample |
| **Evidence** | `docs/evidence/repo-health/<ts>-r1-3-hygiene/` or governance evidence folder |
| **Rollback** | Revert attribute/ignore commits |
| **GO/NO-GO** | **GO** anytime after proposal acceptance of hygiene; **NO-GO** if it blocks higher-priority R0-3 |

---

## R2 — Final governance rebaseline

| Field | Content |
|-------|---------|
| **Objective** | Publish repository-specific final CONFORA rule package and close governance rebaseline against exit criteria. |
| **Dependencies** | All OQs closed or waived; R0-3 done; R0-1/R0-2 done if OQ-1/OQ-2 chose tracking; R0-4/R0-5/R0-6/R0-7 at Register-defined minimum; R1 items done or waived |
| **Allowed files** | `.cursor/rules/**` (if tracked); `docs/governance/**` final rule/rebaseline docs; Canonical registry; evidence |
| **Prohibited changes** | Claiming unimplemented controls as implemented; expanding scope to new product features |
| **Acceptance criteria** | See `GOVERNANCE_REBASELINE_EXIT_CRITERIA.md`; final verdict READY FOR GOVERNANCE REBASELINE or READY WITH CONDITIONS only if residual waivers listed |
| **Required tests** | Fresh-clone checklist; CI tracked-only green; Baseline path resolves; rule globs match registry |
| **Evidence** | `docs/evidence/governance/<ts>-r2-final-rebaseline/` |
| **Rollback** | Revert rule package commit; keep evidence |
| **GO/NO-GO** | **GO** only if exit criteria pass; **NO-GO** if C-01/C-03 class defects remain open without waiver |

---

## Explicitly out of scope for all R0/R1 tasks

- Production data migration  
- Accreditation body submission  
- DPO legal sign-off execution (decision capture only in OQ-7)  
- Broad deletion of `docs/evidence/**`  
- Force-push / history rewrite  
- Claiming external pilot or security-delegate approval
