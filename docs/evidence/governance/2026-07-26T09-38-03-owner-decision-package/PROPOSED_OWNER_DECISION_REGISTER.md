# OWNER_DECISION_REGISTER

**Proposed path:** `docs/governance/OWNER_DECISION_REGISTER.md`  
**Status:** PROPOSED — blank for owner signatures  
**Linked analysis:** `OWNER_DECISION_PACKAGE.md` (proposed in same evidence package)  
**HEAD at proposal:** `e27cdc05`  
**Instruction:** Owners complete one section per OQ. Do not leave “Recommended” as the decision without a signature. Record **Accepted / Accepted with modifications / Rejected / Deferred** explicitly.

---

## How to use this register

1. Read the matching OQ section in the Owner Decision Package.  
2. Select an option ID (A/B/C/D/…).  
3. If modifying the recommendation, write the modification.  
4. Sign with name, role, date.  
5. List any waivers with **expiry date**.  
6. File a copy under `docs/evidence/governance/<timestamp>-owner-decisions-recorded/` after completion (append-only evidence).

**Legend**

| Field | Meaning |
|-------|---------|
| Decision | Final option ID(s) |
| Status | `ACCEPTED` / `ACCEPTED_WITH_MODIFICATIONS` / `REJECTED` / `DEFERRED` |
| Effective date | When remediation may start acting on this decision |
| Waiver | Temporary acceptance of a known risk; requires expiry |

---

## OQ-1 — Governance corpus

| Field | Value |
|-------|-------|
| Question | Track authoritative governance/architecture corpus in Git? |
| Options | A full track / B minimal track / C external SoR / D defer |
| **Recommendation (non-binding)** | **A** |
| **Owner decision** | _TBD_ |
| Status | _TBD_ |
| Modifications | _none / describe_ |
| Rule ownership | _name role responsible for Baseline edits_ |
| Change approval | _e.g. Architecture Lead + Repository Owner for Baseline; Architecture Lead for ADRs_ |
| Versioning | _e.g. Baseline Document ID + git history; ADRs numbered_ |
| Effective date | _YYYY-MM-DD_ |
| Approver (Repository Owner) | _Name / signature / date_ |
| Approver (Architecture Lead) | _Name / signature / date_ |
| Approver (Compliance, optional) | _Name / signature / date_ |
| Closing criteria met | [ ] |

---

## OQ-2 — Cursor rules

| Field | Value |
|-------|-------|
| Question | Track `.cursor/rules/*.mdc` via Git? |
| Options | A track + narrow gitignore / B AGENTS-only / C minimal rules / D docs-based rules |
| **Recommendation (non-binding)** | **A** (after OQ-1 A or B) |
| **Owner decision** | _TBD_ |
| Status | _TBD_ |
| `.gitignore` exception approved | _yes/no; exact text_ |
| Change control for rules | _describe_ |
| Effective date | _YYYY-MM-DD_ |
| Approver (Repository Owner) | _Name / signature / date_ |
| Approver (AI Governance Lead, optional) | _Name / signature / date_ |
| Closing criteria met | [ ] |

---

## OQ-3 — Canonical backend

| Field | Value |
|-------|-------|
| Question | Authoritative backend and disposition of Nest vs FastAPI |
| Options | A recover Nest / B reconstruct Nest / C FastAPI temporary SoR / D track FastAPI freeze / E delete FastAPI / composites A+D or B+D |
| **Recommendation (non-binding)** | **A+D if recoverable; else B+D** |
| **Owner decision** | _TBD_ |
| Status | _TBD_ |
| Nest recovery confirmed? | _yes / no / unknown (discovery deadline: ____)_ |
| FastAPI disposition | _freeze-tracked / freeze-untracked / archive / delete_ |
| ADR-002 supersession required? | _yes/no_ |
| Definition of buildable | _e.g. clean clone typecheck+build `@confora/api`_ |
| Effective date | _YYYY-MM-DD_ |
| Approver (Repository Owner) | _Name / signature / date_ |
| Approver (Architecture Lead) | _Name / signature / date_ |
| Approver (Security Lead) | _Name / signature / date_ |
| Closing criteria met | [ ] |

---

## OQ-4 — Canonical frontend

| Field | Value |
|-------|-------|
| Question | Authoritative frontend application |
| Options | A frontend-app operational canonical + superseding ADR / B enforce ADR-001 apps/web / C dual-canonical period / D defer |
| **Recommendation (non-binding)** | **A** |
| **Owner decision** | _TBD_ |
| Status | _TBD_ |
| Superseding ADR ID | _e.g. ADR-001A / ADR-008_ |
| Operational canonical path | _e.g. frontend-app/_ |
| Target canonical paths | _e.g. apps/web, apps/admin_ |
| Legacy freeze paths | _e.g. frontend-public/_ |
| Workspace membership for frontend-app | _yes/no_ |
| Effective date | _YYYY-MM-DD_ |
| Approver (Repository Owner) | _Name / signature / date_ |
| Approver (Architecture Lead) | _Name / signature / date_ |
| Approver (Product/Pilot, optional) | _Name / signature / date_ |
| Closing criteria met | [ ] |

---

## OQ-5 — Identity, RBAC and SoD

| Field | Value |
|-------|-------|
| Question | Authoritative authN/authZ/SoD residency |
| Options | A Nest+Keycloak end-state / B FastAPI SoR interim / C dual with mapping / D packages/auth owns contracts / recommended composite |
| **Recommendation (non-binding)** | **End-state A; transitional B+D with parity gate** |
| **Owner decision** | _TBD_ |
| Status | _TBD_ |
| Runtime SoR (now) | _Nest / FastAPI / Dual_ |
| Runtime SoR (target) | _Nest+Keycloak_ |
| IdP canonical | _Keycloak / Cognito / Other_ |
| IdP legacy | _… with retirement criteria_ |
| Role vocabulary | _single Nest / single FastAPI / mapped dual_ |
| SoD parity gate defined | _yes/no; link checklist_ |
| Effective date | _YYYY-MM-DD_ |
| Approver (Repository Owner) | _Name / signature / date_ |
| Approver (Security Lead) | _Name / signature / date_ |
| Approver (Compliance / CB Lead) | _Name / signature / date_ |
| Approver (Architecture Lead) | _Name / signature / date_ |
| Closing criteria met | [ ] |

---

## OQ-6 — CI and deployment

| Field | Value |
|-------|-------|
| Question | Valid CI/CD baseline and deploy-backend containment |
| Options | A immediate containment + tracked-only CI / B restore sources first / C rewrite all workflows / D keep as-is |
| **Recommendation (non-binding)** | **A (mandatory)** |
| **Owner decision** | _TBD_ |
| Status | _TBD_ |
| `deploy-backend.yml` action | _disable / workflow_dispatch-only / delete_ |
| GitHub Environment | _name; required reviewers_ |
| Manual gate required for production | _yes/no_ |
| Rollback procedure link | _path or URL_ |
| Tracked-only CI definition | _jobs that must stay green_ |
| Effective date | _YYYY-MM-DD_ |
| Approver (Repository Owner) | _Name / signature / date_ |
| Approver (Security Lead) | _Name / signature / date_ |
| Approver (Ops/Release) | _Name / signature / date_ |
| Closing criteria met | [ ] |

---

## OQ-7 — Data, tenant and audit controls

| Field | Value |
|-------|-------|
| Question | Canonical tenant/audit/PII/evidence controls |
| Options | A mandatory remediation / B remediation + time-boxed waivers / C defer until Nest restore / D FastAPI audit SoR |
| **Recommendation (non-binding)** | **A target; B only for blocked items with expiry** |
| **Owner decision** | _TBD_ |
| Status | _TBD_ |
| Tenant context behaviour | _fail-closed / fail-open (not recommended)_ |
| Update/delete tenant gap | _open defect / accepted risk until ____ / accepted permanent_ |
| Platform-scope bypass policy | _describe; must be logged_ |
| Audit RLS on `AuditEvent` | _enable / do-not-enable / defer-until _____ |
| Write-path PII redaction | _mandatory / waived-until _____ |
| Evidence retention | _append-only; retention period _____ |
| audit-client vs packages/audit | _decision text_ |
| Waivers (table) | _control / reason / owner / expiry_ |
| Effective date | _YYYY-MM-DD_ |
| Approver (Repository Owner) | _Name / signature / date_ |
| Approver (Security Lead) | _Name / signature / date_ |
| Approver (DPO/Privacy) | _Name / signature / date_ |
| Approver (Compliance Lead) | _Name / signature / date_ |
| Closing criteria met | [ ] |

---

## Waiver log (global)

| Waiver ID | OQ | Control / risk | Justification | Owner | Expiry | Status |
|-----------|----|----------------|---------------|-------|--------|--------|
| _W-001_ | _|_ | _|_ | _|_ | _YYYY-MM-DD_ | OPEN/CLOSED |

---

## Package completion gate

| Check | Met |
|-------|-----|
| OQ-1 closed | [ ] |
| OQ-2 closed | [ ] |
| OQ-3 closed | [ ] |
| OQ-4 closed | [ ] |
| OQ-5 closed | [ ] |
| OQ-6 closed | [ ] |
| OQ-7 closed (or waivers recorded) | [ ] |
| All required signatures present | [ ] |
| Evidence copy filed under `docs/evidence/governance/` | [ ] |
| Remediation sequence unblocked for R0-3 at minimum | [ ] |

**Register status:** `OPEN — AWAITING OWNER DECISIONS`  
**Remediation may not execute beyond audit-only work until OQ-6 is signed; R2 final rebaseline requires all OQs closed or waived.**
