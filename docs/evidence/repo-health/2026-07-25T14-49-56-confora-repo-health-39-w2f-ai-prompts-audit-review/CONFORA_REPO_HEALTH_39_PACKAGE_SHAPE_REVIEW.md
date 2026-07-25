# CONFORA-REPO-HEALTH-39 — Package Shape Review

| Element | Present? | Notes |
|---------|----------|-------|
| `package.json` | **yes** | `@confora/ai-prompts` private; exports `dist/`; scripts build/lint/typecheck; no runtime deps |
| tsconfig | **yes** | extends `@confora/config/typescript/node-library`; CJS |
| jest/vitest | **no** | no unit tests |
| `src/` | **yes** | single `index.ts` |
| `prompts/v1/` | **yes** | 5 versioned JSON bundles |
| README/docs | **no** | |
| Schemas/manifests beyond PromptBundle type | **no** | inline TS type only |
| Examples | **no** | |

## Consumers

- `apps/api/package.json` already lists `"@confora/ai-prompts": "workspace:*"`
- `pnpm-lock.yaml` already contains `@confora/ai-prompts`
- `pnpm-workspace.yaml` already includes `packages/*`

Importing this package’s source into git does **not** require root package.json / lockfile / workspace edits.
