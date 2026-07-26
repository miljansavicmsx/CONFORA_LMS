# CONFORA Engineering Constitution

**Document ID:** CON-GOV-CONSTITUTION-001
**Status:** Normative (authored in R0-1B1)
**Owner:** Repository Owner + Architecture Lead
**Authority level:** Governance Hierarchy Level 3 (subordinate to approved owner decisions and the Canonical Development Baseline)

This Constitution defines mandatory engineering principles for all CONFORA work. It does not claim that any principle is fully implemented; implementation requires repository evidence. Where a principle is not yet met, that gap must be recorded (see `CHANGE_CONTROL.md` and the Baseline §0 Rebaseline Addendum).

---

## Mandatory principles

### 1. Repository-driven truth
The tracked repository state is the source of truth. Claims of behaviour, completeness, or compliance must be backed by tracked code, configuration, or evidence — not by intent stated in a document.

### 2. Canonical-before-new
Prefer completing or recovering the canonical component over creating a new parallel one. Do not introduce a second source of truth for identity, data, or workflow. NestJS `apps/api` is the intended canonical backend; its current incompleteness (OQ-3) does not authorize a competing backend.

### 3. No extension of legacy without explicit approval
Legacy or transitional components (e.g. FastAPI `backend/`, `frontend-app`) must not be extended with new scope except under an explicit, recorded owner decision. Operational use of a legacy component is not approval to grow it.

### 4. Smallest complete task scope
Each task must be the smallest change that fully delivers its objective with evidence. Do not bundle unrelated changes, opportunistic refactors, or debt fixes into a feature task.

### 5. Tenant isolation by design
Every tenant-scoped entity carries a tenant identifier; queries are tenant-scoped by default; platform-scope access is explicit and audited. Tenant isolation remains **partially verified** (OQ-7) and requires remediation, not assumption.

### 6. Server-side authorization
All authoritative access and workflow decisions are enforced server-side. The client may reflect state but must never be trusted for authorization.

### 7. RBAC and segregation of duties
Role-based access control and SoD are mandatory and enforced server-side. A single actor must not both perform and approve the same high-risk action. Where one person temporarily holds multiple governance roles, this must be explicitly recorded and material actions require independent review.

### 8. Auditability and evidence
Critical actions emit immutable, append-only, hash-chained audit events. Governance and high-risk changes produce dated evidence packages under `docs/evidence/**`.

### 9. Controlled schema changes
Database schema and migration changes are controlled, reviewed, and reversible where feasible. They are out of scope for governance-only tasks.

### 10. Protection of certification and personal data
Certification records and personal data are protected under the GDPR/retention baseline. Certification evidence is not deleted without retention and legal review.

### 11. Human authority over certification decisions
Certification, appeal, and conformity decisions are made by authorized humans. These decisions must not be made solely by AI or automation.

### 12. AI advisory boundaries
AI is assistive only. AI outputs are labelled, logged (model, prompt hash, input references, output hash), and reviewed where used in certification, assessment, or governance. AI must not fabricate evidence or reproduce copyrighted standards beyond licensed use.

### 13. Generated-file protection
Generated and vendored artifacts (build output, lockfile-derived trees, generated clients) must not be hand-edited as if they were source. Regenerate through the owning tool.

### 14. Independent review for high-risk changes
High-risk changes (deployment, security, certification logic, tenant/audit model, governance corpus) require independent review before merge.

### 15. No merge when required evidence is missing
A change that lacks its required tests, validation, or evidence must not be merged. Missing evidence is a blocking condition.

### 16. Explicit stop conditions
When a precondition fails, a contradiction is detected, or authorization is missing, **stop and report** rather than proceeding or silently working around the control.

---

## Relationship to other governance

- Subordinate to signed owner decisions (`OWNER_DECISION_REGISTER.md`) and the Baseline (`CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md`).
- Enforced through `CHANGE_CONTROL.md`.
- Conflicts are recorded and escalated per `GOVERNANCE_HIERARCHY.md`.
