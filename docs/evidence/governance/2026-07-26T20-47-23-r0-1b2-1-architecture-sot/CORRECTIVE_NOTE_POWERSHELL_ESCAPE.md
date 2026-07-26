# Corrective note — PowerShell escape corruption

## Defect

Initial normative commit `d9f979598976417ad44eeab9ae3dd23efeb6e020` was authored
via PowerShell here-strings that:

- stripped Markdown backticks;
- interpreted `\a` / `\f` escapes (corrupting paths such as `apps/` and
  `frontend-app`).

## Repair sequence (intentionally preserved)

| Commit | Role |
|--------|------|
| `e484155ac9e881c32266c4d361744653d20a32ed` | Repair SoT escaping (six normative files) |
| `cdd8f2cb00073d1978435fa30479be4cb36a4db1` | Record escape-repair evidence |
| `16ccdac0d8ff953c5fca3c06638b955bd3d14277` | Complete deprecation-matrix escape repair |

History was **intentionally preserved** for auditability. Do not rewrite,
squash, or amend these commits merely to obtain a cleaner commit count.

## Final normative tip

The final independently reviewed normative tip is:

`16ccdac0d8ff953c5fca3c06638b955bd3d14277`

Escape-corruption status at that tip: **FULLY CLOSED**.

## Reviewer / PR guidance

Reviewers and PR readers **must assess the final tip**, not the initial
normative commit in isolation.

Independent review verdict (2026-07-26): `GO WITH CONDITIONS` — no normative
content correction required; evidence metadata closure only.
