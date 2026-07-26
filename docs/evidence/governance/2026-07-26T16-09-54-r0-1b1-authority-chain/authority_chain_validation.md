# Authority chain validation — R0-1B1

Goal: a fresh clone can follow tracked `AGENTS.md` to a fully tracked governance chain (closes C-01).

## Chain

1. `AGENTS.md` (tracked, unchanged) → names `docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md` as canonical authority.
2. `docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md` (now tracked) → §0 addendum + governance precedence deferred to `GOVERNANCE_HIERARCHY.md`.
3. `docs/governance/GOVERNANCE_HIERARCHY.md` (now tracked) → defines 7-level order and links only to tracked B1 files.
4. Level 1 → `OWNER_DECISION_REGISTER.md` + `OWNER_DECISION_PACKAGE.md` (tracked).
5. Level 3 → `ENGINEERING_CONSTITUTION.md`, `CHANGE_CONTROL.md`, `STANDARDS_REFERENCE_POLICY.md` (tracked).
6. Companion → `FRONTEND_CANONICALIZATION_GAP_NOTE.md` (tracked).

## Markdown link resolution (normative corpus)

All relative `[text](path)` links in the tracked normative corpus point to files tracked within R0-1B1:

| From | Link target | Resolves to tracked file? |
|------|-------------|---------------------------|
| GOVERNANCE_HIERARCHY.md | OWNER_DECISION_REGISTER.md | Yes |
| GOVERNANCE_HIERARCHY.md | OWNER_DECISION_PACKAGE.md | Yes |
| GOVERNANCE_HIERARCHY.md | CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md | Yes |
| GOVERNANCE_HIERARCHY.md | ENGINEERING_CONSTITUTION.md | Yes |
| GOVERNANCE_HIERARCHY.md | CHANGE_CONTROL.md | Yes |
| GOVERNANCE_HIERARCHY.md | STANDARDS_REFERENCE_POLICY.md | Yes |
| GOVERNANCE_HIERARCHY.md | FRONTEND_CANONICALIZATION_GAP_NOTE.md | Yes |
| GOVERNANCE_HIERARCHY.md | ../../AGENTS.md | Yes (tracked, unchanged) |
| OWNER_DECISION_REGISTER.md | OWNER_DECISION_PACKAGE.md | Yes |
| OWNER_DECISION_PACKAGE.md | OWNER_DECISION_REGISTER.md | Yes |
| OWNER_DECISION_PACKAGE.md | GOVERNANCE_HIERARCHY.md | Yes |
| OWNER_DECISION_PACKAGE.md | CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md | Yes |
| OWNER_DECISION_PACKAGE.md | CHANGE_CONTROL.md | Yes |

The Baseline, Engineering Constitution, Change Control, Standards Reference Policy, and Frontend Gap Note use backtick path references (not markdown links), so they introduce no unresolved `[](…)` links. Automated check: `0` broken relative markdown links in the normative corpus (see `commands_executed.md`).

## Result

Authority chain is **self-contained and tracked**. C-01 is closed.
