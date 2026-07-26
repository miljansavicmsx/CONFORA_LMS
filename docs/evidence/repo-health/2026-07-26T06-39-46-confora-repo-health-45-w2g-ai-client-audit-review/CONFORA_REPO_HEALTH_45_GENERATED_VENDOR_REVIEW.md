# CONFORA REPO HEALTH 45 — Generated / Vendor / Artifact Review

Nothing was deleted, moved, or cleaned in this task.

## Ignored artifact directories (excluded from any import)

| Path | Files | Bytes | Ignore rule |
|------|------:|------:|-------------|
| `packages/ai-client/dist` | 3 | 11,416 | `.gitignore:58 packages/**/dist/` |
| `packages/ai-client/node_modules` | 15 | 20,245 | `.gitignore:3 **/node_modules/` |
| `packages/ai-client/.turbo` | 4 | 739 | `.gitignore:35 .turbo/` |
| `packages/ai-client/coverage` | — | — | not present on disk |

Verified with `git check-ignore -v`; each path resolves to the rule shown. These cannot be staged accidentally by a path-scoped add.

## Generated artifacts NOT covered by ignore rules — primary finding

| Path | Bytes | Kind | `git check-ignore` |
|------|------:|------|--------------------|
| `packages/ai-client/src/index.js` | 4,599 | compiled JS of `src/index.ts` | **NOT_IGNORED** |
| `packages/ai-client/src/index.d.ts` | 5,000 | compiled declarations | **NOT_IGNORED** |
| `packages/ai-client/src/index.js.map` | 3,991 | source map | **NOT_IGNORED** |
| `packages/ai-client/tsconfig.build.tsbuildinfo` | 40,905 | incremental build state | IGNORED (`.gitignore:83 *.tsbuildinfo`) |

Build output was at some point emitted into `src/` instead of `dist/`. Because `.gitignore` only excludes `packages/**/dist/`, these three files are stageable. Consequences:

1. **Staging risk.** `git add packages/ai-client/src` or `git add packages/ai-client` would commit compiled JS, declarations, and a source map — violating the standing "do not import generated artifacts" rule. Mitigation: import by explicit file list only (see the minimal-import-candidate report).
2. **Resolution-shadowing risk.** `src/metadata.test.ts` imports `'./index.js'`. With a real `src/index.js` on disk, tooling can resolve the stale compiled file instead of `index.ts`, so a test run may silently exercise old output. The RH45 test run passed (1/1), but that only tells us the two variants currently agree — it does not remove the ambiguity.
3. **Duplicate-source risk.** `src/index.js` contains its own copy of the two `fetch` call sites (3 pattern hits + 1 in `index.d.ts`), so a reader or scanner can mistake generated output for canonical source.

The correct remedy is deleting the stray artifacts and/or widening the ignore rules, both of which are out of scope for an audit-only task. Recorded as a follow-up recommendation.

## Binary / vendor screen

| Check | Result |
|-------|--------|
| Binaries (`.exe`, `.dll`, `.node`, `.wasm`, archives) | none |
| Vendored third-party source | none — dependencies resolve through pnpm |
| Large files (> 1 MB) | none; largest in-scope file is `tsconfig.build.tsbuildinfo` at 40,905 B, and it is ignored |
| Minified bundles | none |
| Source maps | 1 (`src/index.js.map`) — DO_NOT_IMPORT |

`generated_or_vendor_artifacts_present: true` (generated only, no vendored code) · `large_binary_candidates: []`

## Excluded scope for any future import

```text
packages/ai-client/dist/**
packages/ai-client/node_modules/**
packages/ai-client/.turbo/**
packages/ai-client/src/index.js
packages/ai-client/src/index.d.ts
packages/ai-client/src/index.js.map
packages/ai-client/tsconfig.build.tsbuildinfo
```
