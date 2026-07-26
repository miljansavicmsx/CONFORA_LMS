# CONFORA Governance Rebaseline — Owner Decision Package

> **Status notice (added in R0-1B1, non-normative):** This is an **evidence package**, not normative governance. The `PROPOSED_*.md` files here are **not automatically approved**; approved decisions are recorded in `docs/governance/OWNER_DECISION_REGISTER.md`. Normative authority resides only in tracked files under `docs/governance/**`, per `docs/governance/GOVERNANCE_HIERARCHY.md`. Evidence packages must not override normative governance (Governance Hierarchy Level 7).

**Evidence package:** `docs/evidence/governance/2026-07-26T09-38-03-owner-decision-package/`  
**Based on:** `docs/evidence/governance/2026-07-26T08-43-21-repository-rules-rebaseline/`  
**Branch:** `fix/ca-h01-frontend-f4-cutover`  
**HEAD:** `e27cdc05` / `e27cdc0501bbd9f931d0e71f653ffc5f0d88d1bb`  
**Evidence verdict (upstream):** READY WITH CONDITIONS  
**This package verdict:** **READY FOR OWNER DECISIONS**  
**Mode:** AUDIT / DECISION DESIGN ONLY — no owner decisions executed

## Purpose

This package prepares formal architectural and governance decisions for OQ-1 through OQ-7 before repository remediation and finalisation of the CONFORA rule package.

**No owner decision is made automatically.** Each OQ includes a recommended option; final acceptance remains with the named owner or role.

## Placement rule (important)

The required deliverables are proposed as:

| Proposed target path | Location in this package |
|----------------------|--------------------------|
| `docs/governance/OWNER_DECISION_PACKAGE.md` | `PROPOSED_OWNER_DECISION_PACKAGE.md` |
| `docs/governance/OWNER_DECISION_REGISTER.md` | `PROPOSED_OWNER_DECISION_REGISTER.md` |
| `docs/governance/REPOSITORY_REMEDIATION_SEQUENCE.md` | `PROPOSED_REPOSITORY_REMEDIATION_SEQUENCE.md` |
| `docs/governance/GOVERNANCE_REBASELINE_EXIT_CRITERIA.md` | `PROPOSED_GOVERNANCE_REBASELINE_EXIT_CRITERIA.md` |

They are **not** written into `docs/governance/` in this task, because:

1. that tree is currently untracked (evidence C-01);
2. this task forbids modification of governance documents;
3. placing them under `docs/governance/` before OQ-1 is decided would prejudge the corpus-tracking decision.

After OQ-1 is decided and R0-1 executes, these four files may be promoted into `docs/governance/` under controlled import.

## Crosswalk — this package OQs vs evidence baseline OQs

| This package | Topic | Evidence baseline mapping |
|--------------|-------|---------------------------|
| OQ-1 | Governance corpus | Evidence OQ-1 (docs half), C-01 |
| OQ-2 | Cursor rules | Evidence OQ-1 (rules half), C-01 |
| OQ-3 | Canonical backend | Evidence OQ-2 + OQ-4, C-02, C-04 |
| OQ-4 | Canonical frontend | Evidence OQ-5, C-05 |
| OQ-5 | Identity / RBAC / SoD | C-04, C-07, identity inventory |
| OQ-6 | CI and deployment | Evidence OQ-3, C-03 |
| OQ-7 | Data / tenant / audit | Evidence OQ-6 + OQ-7, C-06, C-08 |

## Reading order

1. This README  
2. `PROPOSED_OWNER_DECISION_PACKAGE.md` — full analysis per OQ  
3. `PROPOSED_OWNER_DECISION_REGISTER.md` — decision form for owner signatures  
4. `PROPOSED_REPOSITORY_REMEDIATION_SEQUENCE.md` — R0–R2 controlled tasks  
5. `PROPOSED_GOVERNANCE_REBASELINE_EXIT_CRITERIA.md` — GO/NO-GO for final rebaseline  
6. `summary.json`

## Non-modification statement

No application code, CI workflow, Git configuration, governance document, Cursor rule, schema, migration, or generated file was modified, staged, or committed. Only files inside this evidence folder were created.

No production, external pilot, DPO/legal, security-delegate, accreditation, or AI-governance approval is claimed.
