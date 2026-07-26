# CONFORA REPO HEALTH 45 — Risk Classification

## Per-file classification (all 9 in-scope files)

| path | class | reason |
|------|-------|--------|
| `packages/ai-client/package.json` | **IMPORT_CANDIDATE** | conventional manifest; only `zod` at runtime; no install hooks; already declared in tracked lockfile |
| `packages/ai-client/tsconfig.json` | **IMPORT_CANDIDATE** | extends tracked `@confora/config/typescript/node-library`; typecheck PASS |
| `packages/ai-client/tsconfig.build.json` | **IMPORT_CANDIDATE** | build config emitting to `dist` (ignored); excludes tests |
| `packages/ai-client/src/index.ts` | **IMPORT_CANDIDATE** | canonical source; no provider coupling, no env, no import-time effects, no PII, no workflow decisions |
| `packages/ai-client/src/metadata.test.ts` | **IMPORT_CANDIDATE** | deterministic in-memory test; 1/1 PASS; no network |
| `packages/ai-client/src/index.js` | **DO_NOT_IMPORT** | compiled artifact inside `src/`, not gitignored; can shadow `index.ts` on resolution |
| `packages/ai-client/src/index.d.ts` | **DO_NOT_IMPORT** | compiled declarations inside `src/`, not gitignored |
| `packages/ai-client/src/index.js.map` | **DO_NOT_IMPORT** | source map |
| `packages/ai-client/tsconfig.build.tsbuildinfo` | **DO_NOT_IMPORT** | incremental build state (already gitignored) |

Ignored directories `dist/**` (3 files), `node_modules/**` (15 files), `.turbo/**` (4 files): **DO_NOT_IMPORT**.

## REWORK_REQUIRED

**None.** No file requires modification before import. In contrast to RH39/RH40 (where `ai-prompts/src/index.ts` had eager `readFileSync` and an unbounded template engine), `ai-client/src/index.ts` has no import-time I/O, no env reads, no unsafe interpolation, and no fallback that hides errors.

## DEFER (tracked open items, non-blocking)

| Item | Why deferred |
|------|--------------|
| `aiPurposeSchema` (10) vs. `AI_PROMPT_IDS_V1` (5) alignment — `question.explain`, `proctoring.video`, `proctoring.audio`, `analysis.exam_result`, `content.draft`, `translate.i18n` have no closed prompt bundle | RH42-class gateway concern; no tracked caller exists (RH43A), so a decision now would be speculative. Belongs to the gateway restoration wave. |
| No timeout / `AbortSignal` on either `fetch` | Robustness hardening; only matters once a caller exists. |
| `createAiGatewayClient` remains exported although `@deprecated` | Removal is a caller-compatibility decision for the gateway wave. |
| Stray compiled artifacts in `src/` should be removed and/or ignore rules widened | Requires deleting untracked files, forbidden in an audit-only task. |

## Residual risk if the 5-file subset is imported

| Risk | Severity | Note |
|------|----------|------|
| Accidental staging of `src/*.js`/`*.d.ts`/`*.map` via directory-scoped add | **medium** | fully mitigated by explicit file-list staging |
| Purpose/prompt-ID mismatch surfacing at runtime | low today | no caller in tracked source; must be resolved before gateway activation |
| Unbounded `fetch` without timeout | low today | not reachable without a caller |
| Provider/vendor call activation | **none** | no vendor SDK, endpoint, or credential exists in the package |
| Weakening of `ai-prompts` fail-closed behaviour | **none** | no coupling to that package |

## Aggregate

`import_candidates: 5` · `rework_required: 0` · `defer: 4 open items` · `do_not_import: 4 files + 3 ignored directories`
