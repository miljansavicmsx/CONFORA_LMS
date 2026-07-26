# R0-1B1 — CONFORA Governance Authority Chain Promotion

**Task:** R0-1B1 (Authority Chain)
**Evidence folder:** `docs/evidence/governance/2026-07-26T16-09-54-r0-1b1-authority-chain/`
**Branch:** `governance/r0-1b1-authority-chain`
**Base commit:** `1f141fe18aafafd0405b1539788234d253f40f4b` (integration `fix/ca-h01-frontend-f4-cutover`, R0-3 merge tip)
**Date:** 2026-07-26
**Verdict:** **READY FOR INDEPENDENT REVIEW**

## Objective

Create and track the minimum self-contained governance authority chain so a fresh clone can satisfy tracked `AGENTS.md`, closing contradiction **C-01** (tracked `AGENTS.md` pointing to an untracked Baseline) without prematurely promoting architecture, compliance, Cursor rules, or provisional evidence as normative governance.

## What was promoted (normative — Commit 1)

| # | Tracked path | Action |
|---|--------------|--------|
| 1 | `docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md` | PROMOTE_WITH_REBASELINE (§0 addendum added) |
| 2 | `docs/governance/GOVERNANCE_HIERARCHY.md` | PROMOTE_WITH_REBASELINE (7-level order) |
| 3 | `docs/governance/ENGINEERING_CONSTITUTION.md` | AUTHORED (OD-R01-5) |
| 4 | `docs/governance/OWNER_DECISION_REGISTER.md` | AUTHORED (OD-R01-5) |
| 5 | `docs/governance/OWNER_DECISION_PACKAGE.md` | AUTHORED (OD-R01-5) |
| 6 | `docs/governance/CHANGE_CONTROL.md` | AUTHORED (OD-R01-5, OD-R01-10) |
| 7 | `docs/governance/STANDARDS_REFERENCE_POLICY.md` | AUTHORED (OD-R01-5) |
| 8 | `docs/governance/FRONTEND_CANONICALIZATION_GAP_NOTE.md` | PROMOTE_AS_IS |

## What was tracked as evidence (non-normative — Commit 2)

- `docs/evidence/governance/2026-07-26T08-43-21-repository-rules-rebaseline/`
- `docs/evidence/governance/2026-07-26T09-38-03-owner-decision-package/`
- `docs/evidence/governance/2026-07-26T14-09-58-r0-1-governance-corpus-inventory/`
- this R0-1B1 evidence package.

Each of the three historical READMEs received a narrowly scoped non-normative **status notice**.

## AGENTS.md

**Initial promotion (commits `4fd42eab`/`f4e2bd18`): not modified** — the Baseline path was already correct, closing C-01 by promotion alone.

**Corrective follow-up (commit `docs(governance): align authority precedence and risk review date`): modified** to close independent-review finding **F-M2**. The Canonical Authority section now states that approved owner decisions are the highest authority and the Baseline is the controlling development baseline subordinate to them, interpreted per `GOVERNANCE_HIERARCHY.md`. The Baseline path is preserved. See `CORRECTIVE_ACTIONS_FM1_FM3.md`.

## Independent review and corrective follow-up

The independent review returned **GO WITH CONDITIONS** (preserved in `INDEPENDENT_REVIEW.md`). Findings **F-M1, F-M2, F-M3** are closed by the corrective commit; see `CORRECTIVE_ACTIONS_FM1_FM3.md`. OQ-3 and OQ-4 remain OPEN; R0-3 remains containment only; production deployment remains unauthorized.

## Mandatory non-claims (preserved)

OQ-3 open (Nest intended, `apps/api` incomplete/not confirmed buildable, FastAPI not approved), OQ-4 open (`frontend-app` operational; ADR-001 contradicted, supersession → R0-1B2), OQ-6 (R0-3 containment only; production deployment unauthorized; deny-all allowlist; admin bypass = temporary RA-R03-1), OQ-7 (tenant/audit partially verified), R0-7 required for CI, OQ-2/R0-2 for Cursor rules.

## Package contents

`repository_identity.md`, `owner_decisions_applied.md`, `source_to_target_manifest.md` / `.json`, `baseline_rebaseline_report.md`, `authority_chain_validation.md`, `non_claims_validation.md`, `copyright_validation.md`, `fresh_clone_governance_validation.md`, `changed_files.md`, `commands_executed.md`, `git_status_before.txt`, `git_status_after.txt`, `summary.json`, `ROLLBACK.md`.

## Note on requested metadata corrections

The two requested string corrections (`?? untracked` → verified status; "twelve signing texts" → "ten signing texts") were **not found verbatim** in any tracked R0-1A evidence file after exhaustive search. No phantom edit was made (see `changed_files.md` §"Requested corrections"). The R0-1A brief that used a signing-text count was returned in-chat and never persisted to a tracked file.
