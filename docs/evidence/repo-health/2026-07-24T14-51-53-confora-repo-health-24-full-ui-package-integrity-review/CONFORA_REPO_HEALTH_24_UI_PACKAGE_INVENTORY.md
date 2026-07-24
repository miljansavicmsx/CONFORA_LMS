# CONFORA-REPO-HEALTH-24 — UI Package Inventory

**Tracked count:** 11  
**Untracked under `packages/ui`:** 0  
**Audit timestamp:** `2026-07-24T14:51:53`

## Inventory

| Path | Bytes | SHA-256 | Imports | Exports | Role |
|------|-------|---------|---------|---------|------|
| `packages/ui/package.json` | 1178 | `ed15e119ed4d579decbfbc3ed94b36b0f4de686eff4c925a1da37a79d0fb920b` | n/a (JSON) | package metadata / exports map | Package manifest |
| `packages/ui/tsconfig.json` | 246 | `3fbcc3ea3941914a1f3cb38e81afdd7bcfec39bb9d255fcbcaf7aff8a0654a18` | extends `@confora/config/...` | n/a | TS project config |
| `packages/ui/tsconfig.build.json` | 259 | `96170fedc55827eda9a200756d375775c1850dbdba38c0cb56570e051f61d86a` | extends `./tsconfig.json` | n/a | Build emit config |
| `packages/ui/postcss.config.cjs` | 87 | `98e8d8a143f16216f4b50a2520024f6254987049b2e199026742a96e16ba411e` | none | default PostCSS plugins | **Tooling** (additional vs minimal source list) |
| `packages/ui/tailwind.config.ts` | 191 | `bec698f6680707ca0571222f2ec5da944afd103be3d81ff295d4305292bdb66c` | `tailwindcss` Config type | default config | **Tooling** (additional vs minimal source list) |
| `packages/ui/tokens.ts` | 6078 | `73cf8c5d95dda904a59dd3b594b9b7f3f1fd1f0da8db2632351421fd93f08bed` | none | `colorTokens`, types, pair helpers | Design-token data |
| `packages/ui/src/button.tsx` | 589 | `a04e168fb422f5d84dee953c33aaa0e763b0c6bacc31f4e5ba44e14f3ab126d9` | `react` type-only | `Button` | Presentational button |
| `packages/ui/src/skip-to-main-link.tsx` | 1331 | `156c2ca091516df18373d79c452809e20cf010d5042c254a33282e15e6602402` | `react` type-only | `SkipToMainLink`, `SkipToMainLinkProps` | A11y skip link |
| `packages/ui/src/ai-disclosure.tsx` | 2360 | `411fcdf35d4860bef880e320e90b6576f4422101fd0a6574c8a5b1e4d96c4239` | `react` type-only | `AiDisclosure`, `AiDisclosureProps` | AI disclosure UI |
| `packages/ui/src/styles.css` | 62 | `7a8b07838661bed82405f51991a10179ba7782d7c2acaff54777b49f020bae77` | Tailwind directives | n/a | Tailwind CSS entry |
| `packages/ui/src/index.ts` | 279 | `d5bb65b02f618d0ff94e940e15254d32db5b42b07995f257015801736a165040` | re-exports only | Button, AiDisclosure(+Props), SkipToMainLink(+Props) | Package barrel |

## Expected vs additional

**Core expected (from W2D-1 / W2D-1R + manifests):**  
`package.json`, `tsconfig.json`, `tsconfig.build.json`, `tokens.ts`, `src/button.tsx`, `src/skip-to-main-link.tsx`, `src/styles.css`, `src/ai-disclosure.tsx`, `src/index.ts`

**Additional tracked (classified — not risk unexpected):**

| Path | Classification |
|------|----------------|
| `packages/ui/postcss.config.cjs` | Package CSS build tooling (prior wave) |
| `packages/ui/tailwind.config.ts` | Tailwind prefix/`cf-` tooling (prior wave) |

**`unexpected_ui_files`:** `[]` (no unauthorized/non-UI/risk files)

## Absent (good)

- No `dist/` tracked
- No `.map` / minified bundles / vendored deps under `packages/ui`
- No notification-template files
