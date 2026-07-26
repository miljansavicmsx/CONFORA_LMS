# Changed files — R0-1B1

## Commit 1 — `docs(governance): establish confora authority chain` (normative)

| Path | Status |
|------|--------|
| `docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md` | new (tracked) — rebaselined |
| `docs/governance/GOVERNANCE_HIERARCHY.md` | new (tracked) — rebaselined |
| `docs/governance/ENGINEERING_CONSTITUTION.md` | new (tracked) — authored |
| `docs/governance/OWNER_DECISION_REGISTER.md` | new (tracked) — authored |
| `docs/governance/OWNER_DECISION_PACKAGE.md` | new (tracked) — authored |
| `docs/governance/CHANGE_CONTROL.md` | new (tracked) — authored |
| `docs/governance/STANDARDS_REFERENCE_POLICY.md` | new (tracked) — authored |
| `docs/governance/FRONTEND_CANONICALIZATION_GAP_NOTE.md` | new (tracked) — as-is |

**AGENTS.md: not staged, not modified.**

## Commit 2 — `docs(repo): add r0-1 governance promotion evidence` (evidence)

| Path | Status |
|------|--------|
| `docs/evidence/governance/2026-07-26T08-43-21-repository-rules-rebaseline/**` | new (tracked) — README status notice added |
| `docs/evidence/governance/2026-07-26T09-38-03-owner-decision-package/**` | new (tracked) — README status notice added |
| `docs/evidence/governance/2026-07-26T14-09-58-r0-1-governance-corpus-inventory/**` | new (tracked) — README status notice added |
| `docs/evidence/governance/2026-07-26T16-09-54-r0-1b1-authority-chain/**` | new (tracked) — R0-1B1 evidence |

## Scope confirmation

No file outside `docs/governance/**` and `docs/evidence/governance/**` was staged. No application code, CI workflow, schema, migration, runtime config, Cursor rule, or architecture/ADR file was modified.

## Requested corrections (metadata)

The task asked to correct two non-material strings in the R0-1A evidence:

1. `?? untracked` → verified status.
2. "twelve signing texts" → "ten signing texts".

**Neither string exists verbatim** in any tracked R0-1A evidence file. Searches performed:
- `?? untracked` as prose: not present in the R0-1A package (only raw `??` git-porcelain lines exist in `git_status_after.txt`, which are correct snapshots and must not be altered).
- `twelve` / `signing text(s)`: not present in any R0-1A `.md`/`.json`.

To preserve evidence integrity, **no phantom edit was made**. The R0-1A owner-decision brief (which enumerated ten signing wordings for OD-R01-1…10) was returned in-chat and never persisted as a tracked file, so there is no file to correct. This is recorded rather than silently ignored.
