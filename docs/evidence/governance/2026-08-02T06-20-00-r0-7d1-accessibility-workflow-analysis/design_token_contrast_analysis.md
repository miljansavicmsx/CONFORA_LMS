# Design-token contrast analysis

## Facts

- Tokens: tracked `packages/ui/tokens.ts` and styles; frontend-app uses CSS variables.
- Current logic: local untracked `tools/a11y/contrast-check.ts` (+ lib, component-pairs).
- Intended: WCAG 1.4.3 / 1.4.11 matrix; normal vs large text in local script.
- Provenance: local only; not on GitHub tip — do not assume promotion.

## Options

- **A — Promote untracked script**: only with provenance + tests (owner).
- **B — Reimplement minimal tracked validator**: preferred if A refused.
- **C — Remove step**: only if equivalent tracked control exists (none today).
- **D — Defer contrast; recover install/browser first**: recommended short-term in Plan C.

Recommendation (not approval): D then B.
