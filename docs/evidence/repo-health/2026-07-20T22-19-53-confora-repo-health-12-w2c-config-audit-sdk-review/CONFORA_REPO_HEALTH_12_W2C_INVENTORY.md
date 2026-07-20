# CONFORA-REPO-HEALTH-12 — W2C inventory

Untracked candidates in scope (manifests already tracked via W2A).

| Package | Untracked | Paths |
|---------|----------:|-------|
| `packages/config` | 7 | `csp/build-csp.mjs`; `eslint.config.mjs`; `eslint-rules/*` (3); `prettier.config.cjs`; `scripts/write-build-stamp.mjs` |
| `packages/audit-client` | 2 | `src/index.ts`; `src/append.test.ts` |
| `packages/sdk` | 2 | `src/index.ts`; `src/generated/schema.ts` (**stub**: `paths = Record<string, never>`) |
| `packages/ui` | 6 | `src/*` components; `tokens.ts` (design tokens) |
| `packages/notification-templates` | 9 | `src/*` event keys; 6 mjml templates |

**W2C candidate count: 26**

## Already tracked (not re-imported)

Config typescript presets + package.json; audit-client/sdk/ui/notification-templates package.json + tsconfigs (+ ui postcss/tailwind).
