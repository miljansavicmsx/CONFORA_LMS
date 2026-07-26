# CONFORA REPO HEALTH 45 — Package Shape Review

## Shape checklist

| Aspect | Present | Detail |
|--------|:-------:|--------|
| `package.json` | **yes** | `@confora/ai-client` `0.0.0`, `private: true`, `type: module`, `main`/`types`/`exports` → `./dist` |
| Typecheck config | **yes** | `tsconfig.json` extends `@confora/config/typescript/node-library`, `rootDir ./src`, `composite: true` |
| Build config | **yes** | `tsconfig.build.json` → `outDir ./dist`, excludes `src/**/*.test.ts` |
| Test config | **yes (script only)** | `"test": "tsx --test src/metadata.test.ts"` — node:test runner, no jest/vitest config needed |
| `src/` | **yes** | single canonical module `src/index.ts` |
| Tests | **yes (thin)** | `src/metadata.test.ts` — 1 test covering `aiMetadataSchema` |
| README / docs / stubs | **no** | no README, no docs, no placeholder stubs |
| `dist/` on disk | yes (ignored) | 3 files / 11,416 B — `.gitignore:58` |
| `node_modules/` on disk | yes (ignored) | 15 files / 20,245 B — `.gitignore:3` |
| `.turbo/` on disk | yes (ignored) | 4 files / 739 B — `.gitignore:35` |
| Compiled artifacts **inside `src/`** | **yes — finding** | `src/index.js`, `src/index.d.ts`, `src/index.js.map` are **not** covered by any ignore rule |
| `tsconfig.build.tsbuildinfo` | yes (ignored) | 40,905 B — `.gitignore:83 *.tsbuildinfo` |

## Scripts declared

```json
"build": "tsc -p tsconfig.build.json",
"lint": "eslint .",
"typecheck": "tsc --noEmit -p tsconfig.json",
"test": "tsx --test src/metadata.test.ts"
```

Scripts match the conventions of already-closed packages (`packages/shared-types`, `packages/audit-client`, `packages/ai-prompts`). No custom postinstall, prepare, or codegen hooks — nothing executes on install.

## Dependency shape

- Runtime dependency: `zod ^3.23.8` only.
- Dev dependencies: `@confora/config` (tracked, `packages/config/typescript/node-library.json` present), `@types/node`, `eslint`, `tsx`, `typescript`.
- No provider SDKs (`openai`, `@anthropic-ai/sdk`, `ollama`), no HTTP client libraries — the package uses the platform `fetch`.

## Shape assessment

Conventional CONFORA node-library shape, consistent with closed packages. The only shape defect is emitted build output living in `src/` rather than `dist/`, which is a hygiene/ignore-coverage problem rather than a behavioural one. It is fully avoidable at import time by importing an explicit file list.

**package_shape:** node-library: `package.json` + 2 tsconfigs + `src/index.ts` + `src/metadata.test.ts`, plus generated artifacts in `src/` and an ignored `tsbuildinfo`; no README.
