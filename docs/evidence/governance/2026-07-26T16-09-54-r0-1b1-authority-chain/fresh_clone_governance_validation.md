# Fresh-clone governance validation — R0-1B1

Simulates what a fresh clone of `governance/r0-1b1-authority-chain` provides for governance.

## Scenario

A new contributor (or AI agent) clones the branch and reads `AGENTS.md`.

| Step | Before R0-1B1 | After R0-1B1 |
|------|---------------|--------------|
| `AGENTS.md` present | Yes (tracked) | Yes (tracked, unchanged) |
| `AGENTS.md` → Baseline path resolves | **No** (Baseline untracked → missing on clone) | **Yes** (Baseline tracked) |
| Baseline → precedence order | Untracked | Tracked (`GOVERNANCE_HIERARCHY.md`) |
| Owner decisions available | Untracked | Tracked (Register + Package) |
| Constitution / Change Control / Standards Policy | Missing | Tracked |
| Frontend contradiction (OQ-4) visible | Untracked | Tracked (Gap Note + Baseline §0.2) |

## C-01 status

**Closed.** The tracked `AGENTS.md` no longer points to a missing document; the full authority chain is present on a fresh clone.

## Explicitly still-open (by design)

- Architecture docs, ADR path move, AI companion merge → **R0-1B2**.
- Compliance mappings and templates → **R0-1B3**.
- Cursor rules → **R0-2**.
- CI reconstruction → **R0-7**.

These are documented as pending in the tracked corpus, not silently omitted.

## Corrective follow-up (F-M2)

`AGENTS.md` now directs a fresh-clone reader to the precedence order in `GOVERNANCE_HIERARCHY.md` (approved owner decisions highest; Baseline subordinate). The entry point is therefore not only present but precedence-consistent with the tracked hierarchy. Baseline path preserved.

**Result: PASS — fresh clone satisfies `AGENTS.md` governance entry point with consistent precedence.**
