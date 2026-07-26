# Governance candidate inventory — R0-1A

Machine-readable register: `governance_candidate_inventory.json` (98 candidates).

## Method

- Enumerated `docs/governance/**`, `docs/architecture/**` (incl. ADRs)
- Searched for multi-tenancy, shared-kernel, AI governance, ISO mappings, security, traceability, templates, owner-decision proposals, root `CONFORA_*` artefacts
- Compared `git ls-files` vs filesystem vs `git check-ignore`
- Cross-read AGENTS.md, Baseline, ADR-001/002, Frontend Gap Note, owner-decision PROPOSED package, R0-3 evidence
- Applied preserved OQ-1…OQ-7 decisions from the task brief

## Headline findings

1. **Zero** `docs/governance` or `docs/architecture` files are currently tracked.
2. They are **not** gitignored — promotion is blocked by absence from history, not ignore rules (except `.cursor/rules/**`).
3. Tracked `AGENTS.md` delegates to an **untracked** Baseline (C-01).
4. Several proposed target filenames do **not** exist yet (constitution, change control, templates, ISO 21001/27001 mappings, `SECURITY_ARCHITECTURE.md`, `STANDARDS_TRACEABILITY_MATRIX.md`).
5. G3–G6 architecture analysis series (33 files) are useful but not required for the OQ-1 authority chain; default classification **RETAIN_AS_EVIDENCE_ONLY** pending owner upgrade.
6. Root `.docx`/`.pdf` binaries should **not** be tracked as SoR without licence review; prefer markdown extracts.

## Classification legend

| Code | Meaning |
|------|---------|
| PROMOTE_AS_IS | Track with path move only (no content rebaseline required for honesty) |
| PROMOTE_WITH_REBASELINE | Track after/alongside edits that preserve OQ facts and contradictions |
| MERGE_WITH_OTHER | Combine with another candidate before tracking |
| SUPERSEDE | Do not promote; replaced by another artefact |
| RETAIN_AS_EVIDENCE_ONLY | Keep as evidence/report; not Baseline-class SoR |
| DO_NOT_TRACK | Exclude from git (binary/licence/OQ-2) |
| UNRESOLVED | Missing file or owner choice required |

## Priority tables

### A — Authority chain (Wave A)

| ID | Current path | Proposed path | Classification |
|----|--------------|---------------|----------------|
| GOV-001 | `docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md` | same | PROMOTE_WITH_REBASELINE |
| GOV-002 | `docs/governance/GOVERNANCE_HIERARCHY.md` | same | PROMOTE_AS_IS |
| GOV-003 | `docs/governance/CONFORA_ROLE_FUNCTION_PERMISSION_MATRIX.md` | `docs/governance/ROLE_AND_SOD_MATRIX.md` | PROMOTE_WITH_REBASELINE |
| GOV-004 | `docs/governance/FRONTEND_CANONICALIZATION_GAP_NOTE.md` | same | PROMOTE_AS_IS |
| GOV-005…012 | remaining `docs/governance/*` | governance or architecture as noted in JSON | PROMOTE_AS_IS / WITH_REBASELINE |
| ARCH-001 | `CANONICAL_COMPONENT_REGISTRY.md` | same under architecture/ | PROMOTE_WITH_REBASELINE |
| ARCH-002 | `LEGACY_DEPRECATION_MATRIX.md` | same | PROMOTE_WITH_REBASELINE |
| ARCH-003 | `STRUCTURE.md` | `ARCHITECTURE.md` | PROMOTE_WITH_REBASELINE |
| ADR-001…007 + README | `docs/architecture/decisions/*` | `docs/architecture/adrs/*` | AS_IS / WITH_REBASELINE |
| STD-001 | `docs/MULTI_TENANCY_STANDARD.md` | `docs/architecture/MULTI_TENANCY_STANDARD.md` | PROMOTE_AS_IS |
| STD-003 | `docs/SHARED_KERNEL_STANDARD.md` | `docs/architecture/SHARED_KERNEL_STANDARD.md` | PROMOTE_AS_IS |
| STD-004 | `docs/AI_GOVERNANCE_MODEL.md` | `docs/governance/AI_GOVERNANCE.md` | PROMOTE_WITH_REBASELINE |

### B — Evidence packages

| ID | Path | Classification |
|----|------|----------------|
| EV-R03 | R0-3 package | RETAIN_AS_EVIDENCE_ONLY (already tracked) |
| EV-REBASELINE | 2026-07-26T08-43-21-… | RETAIN_AS_EVIDENCE_ONLY (recommend **track folder**) |
| EV-OWNERPKG | 2026-07-26T09-38-03-… | RETAIN_AS_EVIDENCE_ONLY (recommend **track folder**) |

### C — Do not include in R0-1

| ID | Path | Reason |
|----|------|--------|
| CURSOR-RULES | `.cursor/rules/**` | OQ-2 → R0-2 |
| ROOT-PDF-AIGOV | `Confora Ai Development Governance Framework V1.pdf` | binary / licence |
| ROOT-*.docx | root Word binaries | poor SoR; convert later |

### D — Missing (author in R0-1B)

ENGINEERING_CONSTITUTION, CHANGE_CONTROL, signed OWNER_DECISION_REGISTER, STANDARDS_REFERENCE_POLICY, ISO_21001/27001 mappings, TASK_TEMPLATE, CURSOR_IMPLEMENTATION_PROMPT_TEMPLATE, INDEPENDENT_REVIEW_TEMPLATE, SECURITY_ARCHITECTURE (as filename), STANDARDS_TRACEABILITY_MATRIX (as filename).

## Full fields

Every candidate in the JSON includes: current path, proposed path, title, owner, source package, status, authoritative/provisional, repository facts, contradictions, duplicates, dependencies, required owner decision, copyright concern, classification, rationale.
