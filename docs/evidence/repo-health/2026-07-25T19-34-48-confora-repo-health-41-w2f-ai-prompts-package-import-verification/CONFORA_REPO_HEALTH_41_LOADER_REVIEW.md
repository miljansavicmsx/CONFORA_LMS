# CONFORA REPO HEALTH 41 — Loader Review

Imported `packages/ai-prompts/src/index.ts` (RH40 rework) verified at HEAD.

| Check | Result |
|-------|--------|
| No top-level `readFileSync` / eager prompt load | **PASS** — fs only inside `loadPromptBundleLazy` via lazy `require('node:fs')` |
| Lazy load on request | **PASS** |
| In-memory cache | **PASS** — `Map<AiPromptIdV1, PromptBundle>` |
| Closed prompt IDs | **PASS** — `chat.educational`, `chat.support`, `question.generate`, `risk.suggest`, `default` |
| Unknown ID fail-closed | **PASS** — throws; no silent default fallback |
| No arbitrary caller path | **PASS** — ID string only |
| No path traversal | **PASS** — filename `` `${id}.json` `` after allowlist check |
| No network/provider/model invocation | **PASS** |
| No `process.env` dependency | **PASS** |
| No tenant/RBAC/SoD/workflow decision behavior | **PASS** |

**eager_fs_removed:** true · **lazy_load_pass:** true · **closed_prompt_ids_pass:** true · **path_traversal_blocked:** true
