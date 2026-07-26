# OWNER_DECISION_PACKAGE

**Proposed path:** `docs/governance/OWNER_DECISION_PACKAGE.md`  
**Status:** PROPOSED — awaiting owner decisions  
**Based on evidence:** `docs/evidence/governance/2026-07-26T08-43-21-repository-rules-rebaseline/`  
**HEAD:** `e27cdc05`  
**Author role:** Independent enterprise architect / repository governance / security / AI-SDLC reviewer  
**Decision authority:** Repository Owner (final). Supporting roles named per OQ.

---

# OQ-1 — Governance corpus

## 1. Exact question

Will the authoritative governance and architecture corpus — including `docs/governance/**`, `docs/architecture/**`, the Baseline cited by `AGENTS.md`, ADRs, and related standards — be **tracked in Git**, with explicit rule ownership, change approval and versioning?

## 2. Verified repository evidence

| Fact | Classification | Path / evidence |
|------|----------------|-----------------|
| All 1087 tracked `docs/` files are under `docs/evidence/` | VERIFIED | evidence `summary.json`, `existing_governance_inventory.md` |
| Tracked docs outside evidence = 0 | VERIFIED | `git ls-files docs` prefix = `evidence` only |
| Baseline exists on disk, untracked | VERIFIED | `docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md` |
| `AGENTS.md` (TRACKED) cites Baseline as higher authority | VERIFIED | `AGENTS.md` |
| 7 ADRs Accepted, all untracked | VERIFIED | `docs/architecture/decisions/ADR-001`…`007` |
| Architecture docs (~41) untracked | VERIFIED | `docs/architecture/**` |
| Multi-tenancy, shared-kernel, AI governance, deprecation standards untracked | VERIFIED | evidence inventory |

## 3. Current contradiction or risk

**C-01:** Tracked `AGENTS.md` mandates obedience to an untracked Baseline. A fresh clone cannot satisfy its own governance instruction. Evidence is versioned; standards are not. Change control for the rules of the system cannot be demonstrated via PR review (ISO/IEC 27001 change-management gap).

## 4. Available decision options

| ID | Option |
|----|--------|
| **A** | Track the full authoritative corpus under `docs/governance/**`, `docs/architecture/**`, and named root standards (`MULTI_TENANCY_STANDARD.md`, `SHARED_KERNEL_STANDARD.md`, `LEGACY_DEPRECATION_PLAN.md`, AI governance docs). Evidence remains append-only under `docs/evidence/**`. |
| **B** | Track a **minimal** corpus only: Baseline + ADRs + Canonical Component Registry + Multi-tenancy Standard. Leave G3–G6 analysis series and other architecture docs untracked or archive offline. |
| **C** | Keep corpus **out of Git**; publish versioned PDFs / SharePoint / wiki as the system of record. Update `AGENTS.md` to cite that external URI. |
| **D** | Defer tracking indefinitely; continue local-only standards. |

## 5. Benefits and disadvantages

| Option | Benefits | Disadvantages |
|--------|----------|---------------|
| A | Restores authority chain; PR-reviewable; supports agent/CI compliance; aligns evidence with standards | Larger initial import; needs ownership/approval workflow; must avoid committing secrets or draft noise |
| B | Faster; still restores Baseline+ADR chain | Incomplete standards remain invisible; agents and reviewers will cite missing docs |
| C | Keeps repo smaller | Breaks agent/clone workflow; dual SoR; weak audit trail for rule changes; conflicts with repo-first RH programme |
| D | Zero immediate effort | Authority chain remains broken; rebaseline cannot close |

## 6. Security impact

Tracking standards does not expose secrets if import is limited to Markdown/ADR content. Improves security *process* by making mandatory controls reviewable. Option C/D leave security mandates unenforceable on fresh clones.

## 7. Compliance and auditability impact

| Control | Impact of A | Impact of C/D |
|---------|-------------|----------------|
| ISO 27001 change control | Standards changes become auditable | Standards changes invisible in repo |
| ISO 17024 / 21001 governance | Documented requirements versioned | Cannot prove which version applied |
| GDPR policy hierarchy (Baseline cites) | Traceable | Broken |

## 8. Migration impact

- Controlled import of selected Markdown trees (R0-1).  
- No runtime migration.  
- Must define: who may edit Baseline/ADRs; ADR supersession process; evidence remains append-only.

## 9. Repository and CI impact

- Increases tracked `docs/` outside evidence.  
- No CI change required initially; optional later: PR check that Baseline path exists.  
- Resolves contradiction between tracked `AGENTS.md` and missing Baseline.

## 10. Recommended decision

**Option A** — track the full authoritative corpus (governance + architecture + named standards). Exclude drafts, local notes, and binary root specs until separately classified.

## 11. Reason for the recommendation

Without a tracked Baseline, every subsequent rule and remediation inherits C-01. Partial tracking (B) recreates the same defect for omitted standards. External SoR (C) fights the repository’s own evidence-first RH model.

## 12. Required owner or role approval

| Role | Why |
|------|-----|
| **Repository Owner** (required) | Final SoR decision |
| Architecture Lead | Corpus scope and ADR process |
| Compliance / Quality Lead (recommended) | ISO document control |

## 13. Consequences if deferred

Authority chain remains broken; R2 final rebaseline cannot GO; agents continue citing missing files; audit cannot prove which governance version applied.

## 14. Required follow-up tasks

- R0-1 Governance corpus tracking  
- Define change-approval for Baseline vs ADRs vs evidence  
- Update Canonical Component Registry if paths change  
- Optional: ADR process README tracked with decisions/

## 15. Acceptance criteria for closing OQ-1

- [ ] Owner selects A/B/C/D in Decision Register  
- [ ] If A or B: named path list approved for import  
- [ ] Rule ownership and change-approval written  
- [ ] `AGENTS.md` Baseline path resolves in a fresh clone after R0-1  
- [ ] Evidence of decision recorded under `docs/evidence/governance/`

---

# OQ-2 — Cursor rules

## 1. Exact question

Will `.cursor/rules/*.mdc` be **tracked and distributed through Git**, with review and change control, given that `.gitignore` currently ignores all of `.cursor/`?

## 2. Verified repository evidence

| Fact | Classification | Path |
|------|----------------|------|
| 9 rule files exist on disk | VERIFIED | `.cursor/rules/*.mdc` |
| Entire `.cursor/` gitignored | VERIFIED | `.gitignore:72` |
| `git ls-files .cursor/` = 0 | VERIFIED | evidence inventory |
| `.cursorrules` legacy file absent | VERIFIED | NOT FOUND |
| `AGENTS.md` tracked and cites Baseline | VERIFIED | `AGENTS.md` |
| Rules mandate compliance with untracked Baseline | VERIFIED | `confora-baseline.mdc` |

## 3. Current contradiction or risk

Rules are local-only and can drift between machines. Fresh clones get no Cursor governance. Rules cite documents that are themselves untracked (C-01). Change control for AI agent behaviour is impossible via PR.

## 4. Available decision options

| ID | Option |
|----|--------|
| **A** | Track `.cursor/rules/**/*.mdc`. Narrow `.gitignore` to ignore `.cursor/*` but **not** `.cursor/rules/`. |
| **B** | Keep rules gitignored; treat `AGENTS.md` + tracked Baseline as the only agent governance. |
| **C** | Track a **minimal** rule set (baseline + architecture + security + AI + testing); leave others local. |
| **D** | Move rule content into tracked `docs/governance/rules/` and generate/sync Cursor rules optionally. |

## 5. Benefits and disadvantages

| Option | Benefits | Disadvantages |
|--------|----------|---------------|
| A | Clone-identical agent behaviour; PR review of rule changes | Requires `.gitignore` surgery; risk of ignoring too little of `.cursor/` |
| B | No ignore-file change | Agents remain ungoverned on fresh clone unless humans copy rules |
| C | Smaller surface | Drift between “official” and local rules |
| D | Rules versioned as docs; tool-agnostic | Sync burden; Cursor may not auto-load from docs path |

## 6. Security impact

Tracking `.mdc` rules is low risk (no secrets expected). Improves consistency of security/AI/SoD instructions to agents. Must not track `.cursor/` state, caches, or credentials if any exist under `.cursor/`.

## 7. Compliance and auditability impact

AI-SDLC and ISO controls that rely on agent refusal of Baseline violations are only auditable if rules are versioned. Option B weakens demonstrable agent governance.

## 8. Migration impact

- Edit `.gitignore` (R0-2) — **allowed only after owner approval of OQ-2**.  
- Controlled `git add` of the 9 `.mdc` files.  
- Depends on OQ-1 so rules do not cite missing Baseline forever.

## 9. Repository and CI impact

- Small tracked file addition.  
- Optional CI: fail if required rule files missing.  
- No app runtime impact.

## 10. Recommended decision

**Option A**, sequenced **after OQ-1 Option A/B** so rules cite a tracked Baseline.

## 11. Reason for the recommendation

Local-only rules recreate the same “evidence without standards” defect. Option D is viable long-term but adds sync complexity before remediation can start. Option A is the minimal fix that matches how Cursor already loads rules.

## 12. Required owner or role approval

| Role | Why |
|------|-----|
| **Repository Owner** (required) | `.gitignore` + distribution policy |
| AI Governance Lead (recommended) | AI rule content |

## 13. Consequences if deferred

Agent behaviour remains non-reproducible; R2 rebaseline cannot claim repository-enforced rules; fresh-clone AI work proceeds without SoD/tenant/AI constraints.

## 14. Required follow-up tasks

- R0-2 Cursor rule tracking  
- Document rule-change approval (same as or linked to corpus process)  
- Align rule globs with `recommended_rule_globs.md` after OQ-3/OQ-4

## 15. Acceptance criteria for closing OQ-2

- [ ] Owner selects A/B/C/D  
- [ ] If A or C: exact `.gitignore` exception approved  
- [ ] Fresh clone lists expected `.cursor/rules/*.mdc` as tracked  
- [ ] Change-control note recorded  
- [ ] No secrets in rule files (scan)

---

# OQ-3 — Canonical backend

## 1. Exact question

What is the **authoritative backend** for CONFORA going forward, and how will the incomplete tracked NestJS `apps/api`, the untracked FastAPI `backend/`, missing Nest modules, and build reproducibility be resolved?

## 2. Verified repository evidence

| Fact | Classification | Path |
|------|----------------|------|
| Nest `apps/api` designated canonical | VERIFIED (docs) | Baseline §4.2, ADR-002, strangler criteria (docs UNTRACKED) |
| Tracked `apps/api` = 20 files | VERIFIED | `git ls-files apps/api` |
| `app.module.ts` imports ~30 missing modules | CONTRADICTED | tracked `app.module.ts`; modules absent |
| Nest audit/auth/verify source largely missing | VERIFIED | RH43A; evidence C-02 |
| `backend/` FastAPI ~338 files, 0 tracked | VERIFIED | evidence C-04 |
| FastAPI labeled frozen legacy | VERIFIED | strangler + `docker-compose.yml` comment |
| CI still targets `@confora/api` and also deploys `backend/` | VERIFIED | `ci.yml`, `deploy-backend.yml` |

## 3. Current contradiction or risk

Designated canonical backend cannot build from git. Operational authorization/SoD/audit tests live in untracked FastAPI. Production deploy workflow still points at FastAPI path. Dual-stack indefinitely = dual IdP, dual roles, dual persistence (C-09).

## 4. Available decision options

| ID | Option |
|----|--------|
| **A** | **Nest canonical, recover/restore** missing `apps/api` source from backup/branch/machine; FastAPI remains frozen legacy until strangler retirement; no new FastAPI features. |
| **B** | **Nest canonical, reconstruct** missing modules from `apps/api/dist/**` + specs + evidence; FastAPI frozen. |
| **C** | **Temporarily elevate FastAPI** as operational SoR until Nest is rebuildable; Nest marked reconstruction target; update Baseline/ADR-002 via superseding ADR. |
| **D** | Import FastAPI into git as **tracked legacy** (read-only freeze) while Nest is restored — dual tracked stacks with explicit freeze rules. |
| **E** | Archive/delete FastAPI without Nest recovery — **not viable** until Nest builds. |

## 5. Benefits and disadvantages

| Option | Benefits | Disadvantages |
|--------|----------|---------------|
| A | Aligns with Baseline; fastest if backup exists | Recovery may be incomplete; need inventory of recovered files |
| B | No dependency on lost source | Lossy (dist ≠ source); high effort; audit risk if reconstructed wrong |
| C | Honest about what runs today | Contradicts Baseline; delays Nest; Cognito/Dynamo remain centre |
| D | Makes SoD/RBAC reviewable in git immediately | Dual tracked stacks; accidental reactivation risk |
| E | Clean end-state | Leaves platform without buildable API |

## 6. Security impact

- A/B: security controls must be **ported or reimplemented** in Nest (today Nest guards NOT FOUND).  
- C/D: FastAPI controls become reviewable but Cognito/Dynamo remain; dual attack surface.  
- Leaving both untracked is worst: controls exist but are not change-controlled.

## 7. Compliance and auditability impact

ISO 17024 SoD and certification workflows are only coded in FastAPI today. Choosing Nest-only without importing or reimplementing SoD creates a **compliance hole**. Choosing FastAPI-as-SoR without ADR supersession creates a **document control hole**.

## 8. Migration impact

- Source recovery or reconstruction programme (R0-4).  
- Strangler phases already documented; Phase 0 coexistence continues until Nest rebuilds.  
- `packages/database` import is a hard dependency for Nest runtime.

## 9. Repository and CI impact

- Until Nest builds, `ci.yml` Nest jobs remain broken.  
- `deploy-backend.yml` must be contained (OQ-6 / R0-3) regardless of A–D.  
- RH programme continues controlled imports.

## 10. Recommended decision

**Option A if recovery is confirmed within a fixed discovery window (e.g. 5 business days); otherwise Option B + Option D (track FastAPI as frozen legacy for reviewability).**  
Do **not** choose E. Do **not** silently choose C without a superseding ADR.

Recommended formal composite: **A-or-B (Nest canonical) + D (track FastAPI freeze)**.

## 11. Reason for the recommendation

Baseline and pilot evidence already designate Nest. Deleting FastAPI before Nest rebuilds destroys the only working SoD/RBAC implementation. Tracking FastAPI as frozen makes C-04 reviewable without declaring FastAPI the long-term canonical API.

## 12. Required owner or role approval

| Role | Why |
|------|-----|
| **Repository Owner** (required) | Canonical stack |
| Architecture Lead (required) | ADR-002 supersession if needed |
| Security Lead (required) | Auth/SoD residency during transition |
| Compliance Lead (recommended) | ISO 17024 continuity |

## 13. Consequences if deferred

Non-buildable canonical API remains; CI stays broken; production deploy path remains incoherent; SoD remains outside git; R0-4/R0-6/R0-7 cannot sequence safely.

## 14. Required follow-up tasks

- R0-3 Deployment safety containment (immediate)  
- R0-4 Canonical backend resolution (recovery inventory → restore or reconstruct)  
- R0-6 Identity/RBAC/SoD integration (depends on OQ-5)  
- R0-7 CI reconstruction  

## 15. Acceptance criteria for closing OQ-3

- [ ] Owner selects A/B/C/D/(A+D)/(B+D)  
- [ ] Written statement: Nest is / is not recoverable  
- [ ] FastAPI disposition: freeze-tracked / freeze-untracked / archive  
- [ ] Superseding ADR if Baseline designation changes  
- [ ] Definition of “buildable”: `pnpm --filter @confora/api` typecheck/build succeeds from clean clone after remediation  

---

# OQ-4 — Canonical frontend

## 1. Exact question

What is the **authoritative frontend** for CONFORA, given ADR-001 (`apps/web` primary, `frontend-app` frozen), current CI and acceptance evidence (`frontend-app`), and migration status “not started”?

## 2. Verified repository evidence

| Fact | Classification | Path |
|------|----------------|------|
| ADR-001 Accepted: `apps/web` primary | VERIFIED (doc untracked) | `docs/architecture/decisions/ADR-001-frontend.md` |
| Gap note: `frontend-app` operational truth, not deprecated for pilot | VERIFIED (doc untracked) | `FRONTEND_CANONICALIZATION_GAP_NOTE.md` |
| Only frontend CI builds `frontend-app` | VERIFIED | `f4-frontend-cutover-gate.yml` |
| Acceptance evidence targets `frontend-app` | VERIFIED | learner/admin final acceptance evidence |
| `apps/web` tracked files = 0 | VERIFIED | `git ls-files apps/web` |
| `frontend-app` outside pnpm workspace | VERIFIED | `pnpm-workspace.yaml` |
| `apps/admin` untracked skeleton | VERIFIED | evidence inventory |

## 3. Current contradiction or risk

**C-05:** Accepted ADR overridden by practice without supersession. Rules scoped to `apps/web/**` govern nothing. Workspace tooling does not include the pilot UI.

## 4. Available decision options

| ID | Option |
|----|--------|
| **A** | Supersede ADR-001: declare **`frontend-app` operational canonical** for pilot/CLRC; `apps/web`/`apps/admin` remain **target** with dated migration plan; `frontend-public` legacy freeze. |
| **B** | Enforce ADR-001: freeze feature work on `frontend-app`; accelerate `apps/web`/`apps/admin` cutover; update CI to Next apps. |
| **C** | Dual-canonical for a defined period: `frontend-app` = learner/staff pilot UI; `apps/web` = public verify/catalog only — with explicit ADR. |
| **D** | Defer; leave ADR-001 Accepted and practice conflicting. |

## 5. Benefits and disadvantages

| Option | Benefits | Disadvantages |
|--------|----------|---------------|
| A | Matches CI/evidence; unlocks honest rule globs; low disruption | Delays Next migration; technical debt acknowledged formally |
| B | Aligns with long-term Baseline | High cost now; Nest API incomplete (OQ-3); risks pilot regression |
| C | Honest about public vs app surfaces | Complexity; three frontends still exist |
| D | None | Governance defect persists |

## 6. Security impact

Frontend choice does not remove need for Nest auth. Option B before Nest rebuild increases hybrid/legacy API exposure. Option A should still require Nest-only for new features (already F4 direction).

## 7. Compliance and auditability impact

WCAG/i18n acceptance already signed on `frontend-app`. Changing canonical without ADR supersession breaks document control. Admin/learner GO evidence must map to the chosen canonical UI.

## 8. Migration impact

- Required: **ADR-001-bis** or superseding ADR (even for Option A).  
- Workspace membership for `frontend-app` (optional but recommended).  
- `frontend-public` consolidation plan remains.

## 9. Repository and CI impact

- Option A: keep/repair `f4-frontend-cutover-gate.yml`; stop pretending CI tests `apps/web`.  
- Option B: replace frontend CI targets; large untracked import of `apps/web`/`apps/admin`.

## 10. Recommended decision

**Option A** — operational canonical = `frontend-app`; target canonical = `apps/web` + `apps/admin`; supersede ADR-001 with an explicit transitional ADR.

## 11. Reason for the recommendation

Evidence, CI and acceptance already treat `frontend-app` as truth. Forcing ADR-001 now, while Nest source is incomplete (OQ-3), creates false compliance. Formal supersession restores document integrity without rewriting history.

## 12. Required owner or role approval

| Role | Why |
|------|-----|
| **Repository Owner** (required) | Canonical UI |
| Architecture Lead (required) | ADR supersession |
| Product / Pilot Owner (recommended) | Pilot continuity |

## 13. Consequences if deferred

Frontend rule package blocked; ADR vs practice conflict remains; reviewers cannot know which UI is governed.

## 14. Required follow-up tasks

- R0-5 Canonical frontend and ADR resolution  
- Draft superseding ADR content  
- Decide workspace membership for `frontend-app`  
- Align `recommended_rule_globs.md` Option 1

## 15. Acceptance criteria for closing OQ-4

- [ ] Owner selects A/B/C/D  
- [ ] Superseding ADR drafted and approved (if A/B/C)  
- [ ] Canonical / transitional / legacy labels written into registry  
- [ ] CI frontend target named explicitly  
- [ ] Rule globs for frontend unblocked

---

# OQ-5 — Identity, RBAC and SoD

## 1. Exact question

Where must the **authoritative** authentication, authorization (RBAC) and segregation-of-duties (SoD) implementation reside, and how will tracked types, untracked FastAPI enforcement, Keycloak vs Cognito, and certification-role separation be reconciled?

## 2. Verified repository evidence

| Fact | Classification | Path |
|------|----------------|------|
| Nest Keycloak types tracked; Nest guards NOT FOUND | PARTIALLY VERIFIED | `packages/shared-types`, missing `apps/api/src/auth/*` modules |
| FastAPI Cognito + `require_permission` + SoD HARD_BLOCK on disk, untracked | VERIFIED | `backend/deps.py`, `backend/core/sod.py`, `sod_policy.py` |
| Two role vocabularies, no mapping | VERIFIED | `USR_*` vs `learner`/`cert_committee` |
| `packages/auth` README stub only | VERIFIED | untracked stub |
| SoD not in Nest | NOT FOUND | evidence C-07 |
| ISO forbidden pairs marked not enforced in FastAPI `roles.py` | VERIFIED | comment in `backend/core/roles.py` |
| Keycloak ops/infra untracked; `.env.example` Keycloak-oriented | PARTIALLY VERIFIED | evidence identity inventory |

## 3. Current contradiction or risk

Security and ISO 17024 SoD controls that actually run are outside git (C-04, C-07). Documented canonical IdP (Keycloak) is not wired in Nest. Dual vocabularies prevent coherent authorization across stacks.

## 4. Available decision options

| ID | Option |
|----|--------|
| **A** | **Nest + Keycloak is sole SoR** once Nest auth/SoD restored; FastAPI auth/SoD frozen; import FastAPI SoD tests as **reference** then reimplement in Nest. |
| **B** | **FastAPI remains SoR for authZ/SoD** until Nest parity gate; track FastAPI auth modules; Nest types remain forward-looking only. |
| **C** | Dual SoR with explicit mapping layer and shared permission catalog in `packages/shared-types` / future `packages/auth`. |
| **D** | Import FastAPI auth into `packages/auth` (language-agnostic specs + Nest ports) as the package owner of RBAC/SoD contracts. |

## 5. Benefits and disadvantages

| Option | Benefits | Disadvantages |
|--------|----------|---------------|
| A | Matches Baseline/G4 | Nest auth missing today; gap until R0-4/R0-6 |
| B | Honest about runtime | Entrenches Cognito/Dynamo; ADR-005 tension |
| C | Continuity during strangler | Highest complexity; mapping bugs = auth bugs |
| D | Clean package ownership | Requires package design work |

## 6. Security impact

Highest-impact OQ after deployment containment. Wrong choice leaves certification decision paths without enforceable SoD in the canonical stack. Mapping errors (C) can create privilege escalation.

## 7. Compliance and auditability impact

ISO 17024 requires demonstrable separation (e.g. assessor vs certification decision). Today that demonstration exists only in untracked FastAPI tests/policy. Accreditation narrative requires a **single named SoR** for SoD enforcement, even if a transitional dual period is allowed.

## 8. Migration impact

- Role vocabulary mapping document (mandatory for any dual period).  
- Keycloak realm roles must align with Nest `rbacRoleSchema`.  
- Certification decision routes must not go live on Nest without SoD port.

## 9. Repository and CI impact

- Need tracked SoD/RBAC tests in whichever SoR is chosen.  
- `backend-tests.yml` only useful if FastAPI is tracked (OQ-3 D).  
- Nest e2e currently thin for RBAC.

## 10. Recommended decision

**Option A as end-state**, with **transitional Option B+D**:  
1) Track FastAPI auth/SoD as frozen reference (depends OQ-3 D);  
2) Own contracts in `packages/shared-types` / nascent `packages/auth`;  
3) Nest+Keycloak becomes sole runtime SoR only after a documented **parity gate** (SoD tests ported and green).

## 11. Reason for the recommendation

Declaring Nest SoR today without implementation is false compliance. Declaring FastAPI permanent SoR fights Baseline. A parity-gated transition preserves ISO continuity and git reviewability.

## 12. Required owner or role approval

| Role | Why |
|------|-----|
| **Repository Owner** (required) | SoR designation |
| Security Lead (required) | IdP + RBAC |
| Compliance / Certification Body Lead (required) | SoD / ISO 17024 |
| Architecture Lead (required) | ADR-005 alignment |

## 13. Consequences if deferred

Cannot claim RBAC/SoD implemented for canonical stack; R0-6 blocked; certification features on Nest unsafe; audit findings remain open.

## 14. Required follow-up tasks

- R0-6 Identity/RBAC/SoD repository integration  
- Role mapping matrix document  
- SoD parity checklist (cert decision, scheme approve≠activate, no self-decision, sys_admin blocked from business decide)  
- Tests: unit + API negative cases  

## 15. Acceptance criteria for closing OQ-5

- [ ] Owner selects end-state and transitional posture  
- [ ] Named SoR for runtime authZ/SoD  
- [ ] IdP decision: Keycloak canonical / Cognito legacy with retirement criteria  
- [ ] Role vocabulary mapping approved or single vocabulary mandated  
- [ ] Parity gate defined before Nest certification routes enable  

---

# OQ-6 — CI and deployment

## 1. Exact question

What is the **valid CI and deployment baseline**, given eight broken workflows on a fresh clone, and specifically what must happen to `deploy-backend.yml` (production path `api.confora.io` / Lambda `confora-lms-api` targeting untracked `backend/`)?

## 2. Verified repository evidence

| Fact | Classification | Path |
|------|----------------|------|
| 8 workflows tracked; 0 executable on fresh clone | VERIFIED | evidence `testing_ci_inventory.md` |
| `deploy-backend.yml` deploys `backend/` on push to main | VERIFIED | `.github/workflows/deploy-backend.yml` |
| `backend/` has 0 tracked files | VERIFIED | `git ls-files backend` |
| Other workflows reference untracked `packages/database`, Dockerfiles, `tests/e2e`, etc. | VERIFIED | `ci.yml`, `accessibility.yml`, … |
| `npm ci` against gitignored `package-lock.json` | VERIFIED | a11y + F4 workflows |
| Lint/typecheck/husky chain tracked and healthy | VERIFIED | root `package.json`, `.husky/**` |

## 3. Current contradiction or risk

**C-03:** Highest operational risk — production deploy workflow armed against a non-existent path. CI green/red signals are meaningless relative to tracked tree. False sense of continuous delivery.

## 4. Available decision options

| ID | Option |
|----|--------|
| **A** | **Immediate containment:** disable or convert `deploy-backend.yml` to `workflow_dispatch` + environment protection + required reviewers; disable or mark other broken workflows `if: false` / path filters until sources tracked; rebuild CI against tracked surface only. |
| **B** | **Restore sources first**, leave workflows enabled (hope imports land before any main push). |
| **C** | Delete all workflows and rewrite from zero after OQ-3/OQ-4. |
| **D** | Keep as-is. |

## 5. Benefits and disadvantages

| Option | Benefits | Disadvantages |
|--------|----------|---------------|
| A | Stops accidental prod deploy; honest CI | Temporary loss of “full” pipeline theatre |
| B | No workflow edits first | Leaves prod deploy armed; unacceptable while `backend/` untracked |
| C | Clean slate | Loses useful workflow structure; larger change |
| D | None | Continues highest-risk finding |

## 6. Security impact

Option A is required for basic change-control and deployment safety. Environment protections and manual gates reduce unauthorized production change. Option B/D leave a latent deployment footgun if `backend/` is ever force-added or if runners cache old trees.

## 7. Compliance and auditability impact

ISO 27001 / SDLC expect controlled deployment. An armed workflow that cannot succeed cleanly still constitutes an uncontrolled automation surface (credentials, environments, OIDC tokens). Manual gates and rollback docs are part of the control.

## 8. Migration impact

- Workflow edits only after owner approval (this task does **not** apply them).  
- Rollback: restore previous workflow YAML from git history.  
- Document required GitHub Environment: `production` with required reviewers.

## 9. Repository and CI impact

- Immediate: reduce to **tracked-only** jobs (lint/typecheck/test for closed packages + thin Nest).  
- Later R0-7: re-enable database/docker/a11y jobs as imports land.  
- Separate deploy pipeline for Nest when buildable.

## 10. Recommended decision

**Option A — mandatory first**, independent of other OQs. Then R0-7 reconstructs CI after OQ-3/OQ-4/OQ-5 imports.

## 11. Reason for the recommendation

Evidence package already ranked this the highest-risk item. No architecture preference justifies leaving production deploy automation pointed at untracked code.

## 12. Required owner or role approval

| Role | Why |
|------|-----|
| **Repository Owner** (required) | Deploy policy |
| Security Lead (required) | Environment protections |
| Ops / Release Manager (required) | Rollback and prod access |

## 13. Consequences if deferred

Continued latent production deployment risk; remediation sequence cannot claim “safe to import”; any accidental `backend/` add could enable deploy.

## 14. Required follow-up tasks

- R0-3 Deployment safety containment  
- GitHub Environment protection checklist  
- Rollback runbook pointer  
- R0-7 CI reconstruction  

## 15. Acceptance criteria for closing OQ-6

- [ ] Owner selects A/B/C/D  
- [ ] Explicit decision on `deploy-backend.yml`: disable / dispatch-only / delete  
- [ ] Named required reviewers / environment  
- [ ] Definition of “tracked-only CI green”  
- [ ] Rollback procedure documented  

---

# OQ-7 — Data, tenant and audit controls

## 1. Exact question

What are the **required canonical controls** for tenant isolation (including platform-scope bypasses), audit append-only behaviour, audit RLS, PII redaction, evidence retention, and related test coverage — and which gaps are accepted risk vs mandatory defects?

## 2. Verified repository evidence

| Fact | Classification | Path |
|------|----------------|------|
| 4 tenant bypasses (2 in tracked Nest extension) | VERIFIED | C-06; `prisma-tenant-extension.ts` |
| Fail-open when tenant context unset | VERIFIED | extension L135 |
| 74 models with tenantId; 63 enforced; 11 gap | VERIFIED | database inventory |
| 8 gov/ISO models without tenant column | VERIFIED | Risk, InternalAudit, … |
| Append-only triggers defined; migration untracked | PARTIALLY VERIFIED | `20260218100001_audit_append_only_and_rls` |
| No RLS on `audit."AuditEvent"` despite migration name | VERIFIED | C-08 |
| Canonical write-path PII redaction NOT FOUND | VERIFIED | audit inventory |
| `createAuditClient` callers = 0 | VERIFIED | audit inventory |
| Registry vs G5 conflict on audit-client | CONTRADICTED | C-08 |
| Evidence corpus 1087 tracked files under evidence | VERIFIED | docs inventory |
| No tracked tests for Nest update/delete bypass | VERIFIED | tenant inventory |

## 3. Current contradiction or risk

Multi-tenancy called “non-negotiable” while fail-open and update/delete gaps exist in tracked code. Immutable audit without write-path redaction creates GDPR erasure tension. Controls designed in untracked migrations cannot be proven from git alone.

## 4. Available decision options

| ID | Option |
|----|--------|
| **A** | **Mandatory remediation:** fail-closed tenant context; compensating controls or redesign for update/delete; classify platform-scope bypasses; add audit write-path redaction; decide RLS-on-audit yes/no; import `packages/database`; resolve audit-client vs `packages/audit`; mandate tests for each bypass. |
| **B** | **Accept selected risks temporarily** with time-boxed waivers (e.g. update/delete gap until Nest Prisma util restored), but still require fail-closed context and redaction design. |
| **C** | Defer all data-control remediation until after full Nest restore. |
| **D** | Treat FastAPI Dynamo audit as continuing SoR (rejected by G5 policy unless ADR supersedes). |

## 5. Benefits and disadvantages

| Option | Benefits | Disadvantages |
|--------|----------|---------------|
| A | Aligns with Baseline / multi-tenancy / GDPR | Depends on database + Nest source imports |
| B | Unblocks sequencing with honesty | Waivers must be visible; easy to forget |
| C | Focuses on buildability first | Leaves known tracked bypasses unaddressed |
| D | — | Conflicts with G5; dual ledger persists |

## 6. Security impact

Tenant bypasses = cross-tenant read/write risk. Platform `sys_admin` bypass must be explicit and logged. Audit without redaction risks storing secrets/PII permanently.

## 7. Compliance and auditability impact

| Topic | Requirement |
|-------|-------------|
| Tenant isolation | Mandatory for multi-tenant ISO/GDPR posture |
| Append-only audit | Required for certification evidence integrity |
| RLS on audit | Optional vs append-only; must not be claimed if absent |
| PII redaction | Required before broad `oldValue`/`newValue` capture in immutable store |
| Evidence retention | Evidence folders append-only; retention schedule still needed |

## 8. Migration impact

- Import `packages/database` (schema + migrations) under RH controls.  
- Possibly new migration for audit RLS and/or redaction columns — only after design approval.  
- GDPR erasure procedure must address append-only ledger (cryptographic erasure / minimization at write).

## 9. Repository and CI impact

- Database job in `ci.yml` only valid after package tracked.  
- Add tenant-isolation and audit-immutability tests to tracked CI.  
- Evidence retention ≠ deleting historical RH packs.

## 10. Recommended decision

**Option A as target**, with **Option B waivers only** for items that literally cannot be fixed until Nest Prisma util / ALS store are restored — each waiver time-boxed and listed in the Decision Register.

Specifically recommend owner affirm:

1. Tenant context **fail-closed** (no query without tenant unless `@PlatformScope`).  
2. Update/delete gap = **open defect** (not accepted permanent risk).  
3. Audit RLS = **decide explicitly** (recommend enable tenant RLS on audit reads; keep append-only triggers).  
4. Write-path PII redaction = **mandatory** before expanding ledger usage.  
5. Evidence = **append-only**; retention policy documented.  
6. `@confora/audit-client` remains transitional client; `packages/audit` is future owner — resolve registry/G5 conflict in writing.

## 11. Reason for the recommendation

Accepting fail-open tenancy or permanent update/delete bypass contradicts the Multi-Tenancy Standard and Baseline. Deferring all controls until Nest is perfect leaves tracked defects unowned. FastAPI audit as SoR contradicts G5.

## 12. Required owner or role approval

| Role | Why |
|------|-----|
| **Repository Owner** (required) | Control baseline |
| Security Lead (required) | Tenant bypass / platform scope |
| DPO / Privacy (required for redaction/erasure) | GDPR |
| Compliance Lead (required) | Audit integrity claims |
| Architecture Lead (recommended) | audit-client vs packages/audit |

## 13. Consequences if deferred

Cannot close governance rebaseline claiming tenant isolation or immutable audit as implemented; R1 tasks unscoped; false compliance risk in external audits.

## 14. Required follow-up tasks

- R1-1 Tenant-isolation bypass remediation  
- R1-2 Audit redaction and integrity remediation  
- Import `packages/database` (sequenced under RH / R0-4 dependency)  
- R1-3 hygiene (line endings, gitignore) supports evidence integrity  

## 15. Acceptance criteria for closing OQ-7

- [ ] Owner selects A/B/C/D and lists any waivers with expiry  
- [ ] Fail-closed vs fail-open decision recorded  
- [ ] Update/delete gap: defect vs accepted risk  
- [ ] Audit RLS: yes / no / defer-with-date  
- [ ] PII redaction requirement: mandatory / waived-until  
- [ ] Evidence retention statement approved  
- [ ] audit-client vs packages/audit conflict resolved in writing  
- [ ] Required tests named for each retained control  

---

# Decision sequencing note

Recommended **decision order** for owners (not code order):

1. **OQ-6** (deployment safety) — can and should be decided first  
2. **OQ-1** then **OQ-2** (authority chain)  
3. **OQ-3** then **OQ-5** (backend + identity)  
4. **OQ-4** (frontend ADR)  
5. **OQ-7** (data controls; may issue waivers pending Nest restore)

Remediation task order is defined in `PROPOSED_REPOSITORY_REMEDIATION_SEQUENCE.md` and intentionally puts **R0-3 before R0-4**.
