# Owner Decisions — R0-3 Deployment Safety Containment

**Decision date (UTC):** 2026-07-26
**Owner:** Repository owner (`miljansavicmsx`, repository administrator)
**Context:** Recorded following the independent review of Draft PR #1 (verdict: **GO WITH CONDITIONS**; see `INDEPENDENT_REVIEW.md`).
**Scope of this record:** Decision recording only. No GitHub settings, workflows, application code, schemas, migrations, or runtime configuration were changed while recording these decisions.

---

## OD-R03-1 — Administrator bypass (`can_admins_bypass`)

**Preferred decision:** Set `can_admins_bypass` to `false` on the `production` Environment.

**Status at recording:** `can_admins_bypass` remains **`true`** (verified via API 2026-07-26). Changing GitHub settings was **not authorized** within this recording task, so the preferred decision could not be applied here.

**Recorded decision (fallback path):** Administrator bypass is accepted as a **temporary residual risk** — see `RISK_ACCEPTANCE.md` (RA-R03-1).

**Compensating controls:**

1. Deployment is `workflow_dispatch` only — no push/tag path an admin could trigger accidentally.
2. Explicit confirmation input (`DEPLOY_PRODUCTION`) and mandatory `deploy_reason` are required even for an admin.
3. Tracked-source preflight fails closed today (`backend/` has 0 tracked files), so a bypassed approval still cannot reach AWS credential configuration or Lambda update.
4. Empty deployment-branch allowlist (OD-R03-2) independently blocks environment deployments in selected-branch mode.
5. `prevent_self_review: true` on the required-reviewers rule.
6. Any dispatch run and any environment bypass is visible in the Actions run history and environment deployment activity log (append-only on GitHub's side).

**Exit condition (mandatory before production deployment is enabled):**

- Add at least one **independent release reviewer** (a person other than the deploying admin) to the `production` Environment required reviewers, **and**
- Set `can_admins_bypass` to `false`,
- both verified via API and recorded in evidence **before** any production deployment is authorized.

**Rationale:** Single-maintainer repository at present; the bypass capability cannot enable a deployment today because of the layered fail-closed controls above. Applying the toggle requires an authorized settings-change task.

**Residual risk:** A repository admin could bypass the reviewer gate on a future run after `backend/` becomes tracked, if the exit condition has not been executed by then. Tracked in `RISK_ACCEPTANCE.md` with a review date.

---

## OD-R03-2 — Deployment branch policy (empty custom allowlist)

**Decision:** Keep the current **empty custom deployment branch allowlist** as an **intentional, temporary deny-all control**. The allowlist was **not** populated during this task.

**Effect:** With `custom_branch_policies: true` and zero named entries, GitHub rejects environment deployments from any branch or tag — deny-all, fail-closed.

**Exit criteria (all required before populating the allowlist):**

1. OQ-3 is resolved (canonical backend decision made);
2. a tracked and reproducible backend deployment source is approved;
3. the authorized deployment branch or tag pattern is formally decided and documented;
4. the resulting production branch policy is independently reviewed.

**Rationale:** Until a canonical, tracked backend exists, no branch is a legitimate production deployment source; deny-all is the correct posture and costs nothing operationally.

**Residual risk:** None additional (the control is restrictive, not permissive). Operational note: legitimate future deployments will be blocked until the exit criteria are met — this is intended.

---

## OD-R03-3 — Canonical backend (OQ-3)

**Decision:** **OQ-3 remains open.** R0-3 explicitly does **not**:

- select a canonical backend;
- approve `backend/` (FastAPI/Lambda tree) as a production source;
- redirect deployment to `apps/api` (NestJS) or any other runtime;
- authorize any production deployment.

The contained workflow preserves the pre-existing Lambda target solely so that, once OQ-3 is resolved in favour of a tracked `backend/`, the pipeline can be reused under the manual gates. If OQ-3 resolves differently, this workflow must be revisited under a separate approved change.

**Rationale:** Containment must not smuggle in an architecture decision; the independent review confirmed no implicit canonicalization occurred.

---

## OD-R03-4 — CI remediation (R0-7)

**Decision:** **R0-7 remains the approved task** for repairing all other CI workflows that reference untracked or invalid paths (`ci.yml`, `accessibility.yml`, `backend-tests.yml`, `backend-nightly.yml`, `confora-qa.yml`, `f4-frontend-cutover-gate.yml`, `release-candidate.yml`).

None of those workflows deploys the production Lambda or `api.confora.io`; they were inspected and intentionally left unmodified in R0-3 (see `WORKFLOW_INVENTORY_AND_TRIGGERS.md`).

**Rationale:** Keeping R0-3 single-purpose preserved reviewability and scope integrity.

---

## OD-R03-5 — Merge interpretation of PR #1

**Decision:** PR #1 may be merged **only as a deployment-safety containment control**.

Merge of PR #1 must **not** be interpreted as:

- production readiness;
- go-live approval;
- OQ-3 closure;
- approval of the Lambda backend (or any backend) as canonical;
- accreditation, DPO, legal, or security approval.

**Rationale:** The PR's sole function is to remove the unsafe automatic deployment path and install fail-closed manual gates; every other claim remains explicitly out of scope (see "Claims not made" in `README.md`).

---

## Decision register summary

| ID | Decision | Owner | Date (UTC) | Residual risk | Exit criteria |
|----|----------|-------|------------|---------------|---------------|
| OD-R03-1 | Admin bypass accepted temporarily (preferred `false` not applied — settings change not authorized in this task) | Repository owner | 2026-07-26 | RA-R03-1 (admin can bypass reviewer gate) | Independent release reviewer added **and** `can_admins_bypass=false`, before production deployment is enabled |
| OD-R03-2 | Empty branch allowlist kept as intentional temporary deny-all | Repository owner | 2026-07-26 | None (restrictive control) | OQ-3 resolved; tracked source approved; branch/tag pattern decided; policy independently reviewed |
| OD-R03-3 | OQ-3 remains open; no canonical backend selected by R0-3 | Repository owner | 2026-07-26 | Untracked `backend/` persists locally (blocked from pipeline) | OQ-3 owner decision |
| OD-R03-4 | R0-7 remains approved path for CI repair | Repository owner | 2026-07-26 | Broken/stale CI on fresh clone | R0-7 completion |
| OD-R03-5 | Merge = containment only | Repository owner | 2026-07-26 | Misinterpretation risk (mitigated by this record) | N/A — standing interpretation rule |
