# TypeScript + Vite clean-checkout gate

## Owner requirement

Must not replace TypeScript validation with only `vite build`.

Preferred semantic:

```text
typecheck
vite build
```

## Proposed scripts (future implementation names)

| Script | Command | Meaning |
|--------|---------|---------|
| `typecheck:a11y` | `tsc -b -p tsconfig.a11y.json --pretty false` | Truthful check of **exactly** the justified closure + a11y entry |
| `build:a11y` | `vite build -c vite.a11y.config.ts` | Emit a11y preview bundle |
| `ci:a11y` | `typecheck:a11y && build:a11y` | Clean-checkout gate |

## `tsconfig.a11y.json` rules

- `include`: explicit paths (closure list + `main.a11y.tsx` + `App.a11y.tsx` + `vite-env.d.ts` as needed)
- Must **not** use `"include": ["src"]` (that reintroduces untracked/unjustified modules and/or forces full-tree promotion)
- Strictness should match product intent; do not disable `strict` to hide errors
- Known debt **outside** the include list is out of scope for the a11y job

## Relationship to product `build`

- Product `npm run build` may later restore `tsc -b && vite build` when the full tracked graph is ready.
- A11y CI must not claim full-app typecheck.

## Rejected anti-pattern (R0-7D2R)

```json
"build": "vite build"
```

with typecheck demoted and unused in CI — **not acceptable** for the next implementation.
