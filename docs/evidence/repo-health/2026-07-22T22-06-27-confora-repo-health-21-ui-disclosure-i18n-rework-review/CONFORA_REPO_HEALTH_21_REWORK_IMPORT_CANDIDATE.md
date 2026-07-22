# CONFORA-REPO-HEALTH-21 — Rework Import Candidate

## Future import candidate list

**Empty for this audit.** No files approved for immediate import.

| Path | Current class | Future import eligible? |
|------|---------------|-------------------------|
| `packages/ui/src/ai-disclosure.tsx` | REWORK_REQUIRED | Only after i18n + governance rework **and** RH verification |
| `packages/ui/src/index.ts` | REWORK_REQUIRED | Only after disclosure GO **or** split primitives-only barrel without unreworked disclosure |

## Proposed future wave (not executed)

**W2D-1R** — Disclosure i18n rework + optional barrel split:

1. Implement required props / no hardcoded product English.
2. Align recommended product copy with human-oversight / non-decision constraints.
3. Re-audit (RH22-class verification).
4. Import `ai-disclosure.tsx` alone **or** with a split/safe barrel.
5. Do **not** use `git add .` / broad `packages/` adds.

## Future import GO recommendation

**`NO-GO`**

Rationale: hardcoded English product disclosure + barrel re-exports unreworked component. Security/network/runtime are clean but insufficient alone.

## What is already GO (prior W2D-1 — do not re-import)

- `packages/ui/tokens.ts`
- `packages/ui/src/button.tsx`
- `packages/ui/src/skip-to-main-link.tsx`
- `packages/ui/src/styles.css`
