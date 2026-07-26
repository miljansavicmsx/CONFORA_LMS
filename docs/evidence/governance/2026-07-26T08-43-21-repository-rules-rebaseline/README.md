# CONFORA Governance Repository Evidence Baseline

> **Status notice (added in R0-1B1, non-normative):** This is an **evidence package**, not normative governance. Any `PROPOSED_*.md` file here is **not automatically approved**. Normative authority resides only in tracked files under `docs/governance/**`, per `docs/governance/GOVERNANCE_HIERARCHY.md`. Evidence packages must not override normative governance (Governance Hierarchy Level 7).

**Evidence package:** `docs/evidence/governance/2026-07-26T08-43-21-repository-rules-rebaseline/`
**Repository:** `C:\Users\milja\Desktop\CONFORA_LMS`
**Branch:** `fix/ca-h01-frontend-f4-cutover`
**HEAD:** `e27cdc05` / `e27cdc0501bbd9f931d0e71f653ffc5f0d88d1bb`
**Date:** 2026-07-26
**Mode:** AUDIT-ONLY

## Purpose

This package records the verified state of the CONFORA repository so that an independent reviewer can convert the provisional CONFORA governance package into a repository-specific final version. It answers one question above all others: **what is actually in this repository, versus what is only described in documents or present only on one developer's disk?**

## Final verdict

**READY WITH CONDITIONS** — see `contradictions_and_open_questions.md` §Conditions.

The evidence baseline is complete and internally consistent. However, the repository exhibits a systemic **tracked-versus-on-disk divergence** that a governance rebaseline must account for explicitly. Rules written against documents alone would govern code that does not exist in git.

## The single most important finding

| Layer | In git? |
|-------|:-------:|
| Compliance **evidence** (`docs/evidence/**`, 1087 files) | **YES** |
| Governing **standards** (Baseline, ADRs, tenancy/shared-kernel/AI standards) | **NO** |
| `.cursor/rules/**` (9 rule files) | **NO** — gitignored (`.gitignore:72`) |
| `AGENTS.md` (cites the Baseline as authority) | **YES** |

`AGENTS.md` is tracked and mandates compliance with `docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md`, which is **untracked**. A fresh clone therefore cannot satisfy its own top-level governance instruction. The documentation posture is inverted: the repository versions its proof of compliance but not the rules it is proving compliance against.

## Reading order

| # | File | Contents |
|---|------|----------|
| 1 | `repository_identity.md` | Path, branch, SHAs, remotes, status counts, last 20 commits |
| 2 | `repository_structure.md` | Tracked vs on-disk topology, per-package counts |
| 3 | `canonical_legacy_inventory.md` | Canonical vs legacy backends, frontends, verify, catalog |
| 4 | `database_persistence_inventory.md` | Prisma, migrations, DynamoDB, tenant-owned models |
| 5 | `identity_rbac_sod_inventory.md` | Keycloak/Cognito, guards, roles, permissions, SoD |
| 6 | `tenant_isolation_inventory.md` | Tenant context, guards, known bypasses, tests |
| 7 | `audit_evidence_inventory.md` | Audit ledger, hash chain, append-only, evidence corpus |
| 8 | `testing_ci_inventory.md` | Tests by type, all 8 CI workflows, fresh-clone executability |
| 9 | `existing_governance_inventory.md` | Cursor rules, AGENTS.md, ADRs, standards |
| 10 | `generated_files_inventory.md` | Build artifacts and ignore coverage |
| 11 | `contradictions_and_open_questions.md` | Conflicts, open questions, conditions |
| 12 | `recommended_rule_globs.md` | Proposed rule scoping for the rebaseline |
| 13 | `commands_executed.md` | Reproducible command log |
| 14 | `git_status_before.txt` / `git_status_after.txt` | Pre/post state proof |
| 15 | `summary.json` | Machine-readable roll-up |

## Classification scheme

Every material conclusion in this package carries one of:

- **VERIFIED** — found in the repository, inspected, and (where claimed) confirmed wired
- **PARTIALLY VERIFIED** — fragments present; incomplete, or documented target not fully realised
- **ASSUMED** — asserted by documentation without re-verifiable code in the current tree
- **NOT FOUND** — path or control absent
- **CONTRADICTED** — sources disagree, or tracked code references things that do not exist

A control is **not** marked implemented merely because it is documented.

## Non-modification statement

No application code, database schema, migration, configuration, generated file, CI workflow, Cursor rule, or existing governance document was modified, created, deleted, or staged. The only files written are the 17 artifacts inside this evidence folder. Proof: `git_status_before.txt` and `git_status_after.txt` are identical outside this folder, and the index was empty before and after.

No findings were repaired during this task.
