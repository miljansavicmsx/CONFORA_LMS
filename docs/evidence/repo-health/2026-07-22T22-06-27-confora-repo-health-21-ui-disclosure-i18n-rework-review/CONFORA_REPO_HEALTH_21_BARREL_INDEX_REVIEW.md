# CONFORA-REPO-HEALTH-21 — Barrel Index Review

**File:** `packages/ui/src/index.ts`  
**Status:** untracked · **Class:** `REWORK_REQUIRED` (coupled to disclosure)  
**Bytes:** 217 · **SHA-256:** `c1608f02fd273f9ad87bac2fa15d935a3aec19998188a26b2db12b876af0e884`

## Current exports

```ts
export { Button } from './button.js';
export { AiDisclosure } from './ai-disclosure.js';
export { SkipToMainLink } from './skip-to-main-link.js';
export type { SkipToMainLinkProps } from './skip-to-main-link.js';
```

## Barrel behavior

| Export | Tracked module today | Risk if barrel imported now |
|--------|----------------------|-------------------------------|
| `Button` | yes (W2D-1) | Low — already importable via deep path |
| `SkipToMainLink` (+ type) | yes (W2D-1) | Low — residual i18n guardrail remains |
| `AiDisclosure` | **no** (untracked REWORK) | **High** — exposes unreworked hardcoded English disclosure |

## Unintentional exposure risk

Importing `@confora/ui` via this barrel (after adding `"exports"` / main entry that points at `index.ts`) would:

1. Make `AiDisclosure` a first-class public API.
2. Bypass the intentional W2D-1 exclusion of disclosure.
3. Package consumers could adopt REWORK_REQUIRED copy without a dedicated gate.

**Therefore:** approve **neither** barrel import nor package main entry that re-exports unreworked disclosure.

## Required index rework options

### Option A — Keep excluded (safest until disclosure passes)

- Leave `packages/ui/src/index.ts` untracked.
- Consumers continue deep imports:
  - `@confora/ui/button` / relative paths already used by package layout, or
  - documented subpath exports for `button`, `skip-to-main-link`, `tokens`, `styles` only.
- Import barrel only after `ai-disclosure.tsx` passes i18n + governance rework and RH verification.

### Option B — Split safe primitives from disclosure

- Create a primitives barrel (e.g. `src/primitives.ts` or slim `index.ts`) exporting only:
  - `Button`, `SkipToMainLink`, types
- Keep `AiDisclosure` on a separate entry (e.g. `src/ai-disclosure.ts` export path) gated until rework, **or** omit until GO.
- Do **not** re-export disclosure from the default package entry until GO.

## Recommendation

**Option A preferred short-term** (zero new surface).  
**Option B** acceptable if product needs a clean `@confora/ui` entry for Button/Skip only — still **must not** include unreworked `AiDisclosure`.

## Verdict

**Do not import `index.ts` as-is.** Barrel export risk: **blocking** for future W2D-1R until disclosure rework lands or exports are split.
