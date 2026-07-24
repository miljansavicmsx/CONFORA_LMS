# CONFORA-REPO-HEALTH-22 — Barrel Index Review

**File:** `packages/ui/src/index.ts`  
**SHA-256:** `d5bb65b02f618d0ff94e940e15254d32db5b42b07995f257015801736a165040`

## Exports (explicit)

```ts
export { Button } from './button.js';
export { AiDisclosure } from './ai-disclosure.js';
export type { AiDisclosureProps } from './ai-disclosure.js';
export { SkipToMainLink } from './skip-to-main-link.js';
export type { SkipToMainLinkProps } from './skip-to-main-link.js';
```

| Export | Safe? | Notes |
|--------|-------|-------|
| `Button` | yes | Already tracked W2D-1 primitive |
| `SkipToMainLink` / `SkipToMainLinkProps` | yes | Already tracked W2D-1 primitive |
| `AiDisclosure` / `AiDisclosureProps` | yes | Rework verified in this audit |
| Notification templates | n/a | **not exported** |
| Forbidden packages | n/a | **not referenced** |

## Side effects

- Re-export only; no executable statements, no I/O, no env access.
- Module import side effects: **none**.

## RH21 residual risk resolution

RH21 blocked barrel because it re-exported unreworked hardcoded-English disclosure.  
After W2D-1R + this verification, that risk is **cleared**.

## Verdict

**`barrel_index_safe`: true** — eligible to import together with `ai-disclosure.tsx`.
