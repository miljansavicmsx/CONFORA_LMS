# R0-1A — Governance Corpus Inventory and Promotion Plan

> **Status notice (added in R0-1B1, non-normative):** This is an **evidence package**, not normative governance. Its inventory, recommendations, and any `PROPOSED_*` references are **not automatically approved**. Approved owner decisions are recorded in `docs/governance/OWNER_DECISION_REGISTER.md`, and normative authority resides only in tracked files under `docs/governance/**`, per `docs/governance/GOVERNANCE_HIERARCHY.md`. Evidence packages must not override normative governance (Governance Hierarchy Level 7).

**Task:** R0-1A (first stage of R0-1 Governance Corpus Tracking)  
**Evidence folder:** `docs/evidence/governance/2026-07-26T14-09-58-r0-1-governance-corpus-inventory/`  
**Integration branch:** `fix/ca-h01-frontend-f4-cutover`  
**Verified tip:** `1f141fe18aafafd0405b1539788234d253f40f4b`  
**R0-3 status:** `MERGED — CONTAINMENT ACTIVE WITH CONDITIONS`  
**Date:** 2026-07-26  

## Verdict

**READY FOR OWNER PROMOTION APPROVAL**

This package inventories the local governance/architecture corpus, classifies every candidate, and proposes a controlled promotion manifest. **No documents were promoted or committed** in R0-1A.

## What this enables

The repository owner can approve exactly which documents become tracked under:

- `docs/governance/**`
- `docs/architecture/**`
- and related `docs/compliance/**`, `docs/tasks/**`, `docs/prompts/**`, `docs/reviews/**` paths

Execution of any approved promotion is deferred to **R0-1B** (`r0-1b_task_specification.md`).

## Preserved owner decisions (mandatory)

| ID | Decision preserved in this inventory |
|----|--------------------------------------|
| OQ-1 | Authoritative governance/architecture corpus will be tracked in Git |
| OQ-2 | Cursor rules later under R0-2 — **excluded from R0-1** |
| OQ-3 | NestJS intended canonical backend; recovery/reconstruction required; FastAPI later as frozen legacy only after approved task; **do not claim Nest currently complete/buildable** |
| OQ-4 | `frontend-app` is current operational canonical frontend pending ADR superseding ADR-001 — **contradiction must not be omitted** |
| OQ-5 | Canonical identity/RBAC/SoD end-state in canonical stack with transitional parity gate |
| OQ-6 | R0-3 deployment containment merged and active with conditions |
| OQ-7 | Tenant isolation and audit controls partially verified; separate remediation required |

## Classification summary (98 candidates)

| Classification | Count |
|----------------|------:|
| PROMOTE_AS_IS | 19 |
| PROMOTE_WITH_REBASELINE | 14 |
| MERGE_WITH_OTHER | 12 |
| SUPERSEDE | 1 |
| RETAIN_AS_EVIDENCE_ONLY | 33 |
| DO_NOT_TRACK | 6 |
| UNRESOLVED | 13 |

## Recommended Wave A (authority chain)

Minimum set to close the tracked-`AGENTS.md` → untracked-Baseline break (C-01), subject to owner approval and R0-1B rebaseline edits where classified `PROMOTE_WITH_REBASELINE`. See `promotion_manifest.md` / `.json`.

## Explicit non-claims

This inventory does **not**:

- promote or commit any governance file;
- track `.cursor/rules/**`;
- close OQ-3 or approve FastAPI tracking;
- claim production readiness;
- claim NestJS `apps/api` is complete/buildable;
- silently resolve the ADR-001 vs `frontend-app` contradiction;
- commit copyrighted ISO/BAS PDF standard text.

## Package contents

| File | Purpose |
|------|---------|
| `repository_identity.md` | Branch/tip/PR verification |
| `governance_candidate_inventory.md` / `.json` | Full candidate register |
| `duplicate_and_supersession_analysis.md` | Duplicates and merges |
| `contradictions_register.md` | Known contradictions (incl. OQ-4) |
| `proposed_target_structure.md` | Refined target tree |
| `promotion_manifest.md` / `.json` | Owner-approvable waves |
| `standards_reference_policy.md` | How standards may be cited |
| `copyright_and_licensing_findings.md` | Binary/PDF/docx findings |
| `owner_decisions_required.md` | Decisions needed before R0-1B |
| `r0-1b_task_specification.md` | Next execution task |
| `commands_executed.md` | Command log |
| `git_status_before.txt` / `git_status_after.txt` | Working-tree snapshots |
| `summary.json` | Machine-readable summary |
