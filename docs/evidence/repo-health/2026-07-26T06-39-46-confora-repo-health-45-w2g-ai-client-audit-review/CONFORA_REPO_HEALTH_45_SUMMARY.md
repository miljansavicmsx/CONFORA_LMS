# CONFORA REPO HEALTH 45 — Summary

**Task:** W2G `packages/ai-client` Audit-Only Review
**Mode:** Audit / report only (no import, no staging, no source edits)
**Branch:** `fix/ca-h01-frontend-f4-cutover`
**HEAD:** `2096d944` (`docs(repo): add remaining source package rebaseline`)
**Evidence:** `docs/evidence/repo-health/2026-07-26T06-39-46-confora-repo-health-45-w2g-ai-client-audit-review/`

## Verdict

**CONFORA_REPO_HEALTH_45_AI_CLIENT_AUDIT_READY_FOR_REVIEW**

`packages/ai-client` is a small contracts-plus-internal-gateway-client library. It contains **no external provider clients**, **no `process.env` usage**, **no hardcoded endpoints**, **no prompt construction**, and **no import-time side effects**. A 5-file source subset is a clean **IMPORT_CANDIDATE**. The blocking concern is hygiene, not behaviour: compiled output (`index.js`, `index.d.ts`, `index.js.map`) sits **inside `src/` and is not gitignored**, so a directory-scoped `git add` would sweep generated artifacts into the repo.

## Key results

| Item | Result |
|------|--------|
| In-scope files | **9** (plus 22 in ignored `dist`/`node_modules`/`.turbo`) |
| Package shape | node-library; manifest + 2 tsconfigs + 1 source + 1 test (+ generated artifacts) |
| External provider coupling | **none** (no OpenAI/Anthropic/Ollama/axios/WebSocket) |
| Network behaviour | 2 `fetch` calls to internal `/v1/ai/*`, runtime-active only when called |
| Import-time side effects | **none** (zod schema construction only) |
| Secrets / PII / tenant | **0 / 0 / 0** |
| Manifest changes needed | **none** — `apps/api/package.json` + `pnpm-lock.yaml` already declare the dep |
| Weakens ai-prompts fail-closed | **no** |
| Workflow boundary blocking | **0** |
| Typecheck / tests | PASS / **1/1 PASS** |

## Notable finding

Tracked `apps/api/package.json` and `pnpm-lock.yaml` already reference `@confora/ai-client`, but the package source is untracked. Importing the source subset **reduces** that inconsistency and requires no manifest/lockfile/workspace edits.

## Recommended next action

`RH46_CONTROLLED_IMPORT_OF_AI_CLIENT_SOURCE_SUBSET_5_FILES_EXCLUDING_GENERATED_ARTIFACTS` — explicit file-list import only; never `git add packages/ai-client/src`.
