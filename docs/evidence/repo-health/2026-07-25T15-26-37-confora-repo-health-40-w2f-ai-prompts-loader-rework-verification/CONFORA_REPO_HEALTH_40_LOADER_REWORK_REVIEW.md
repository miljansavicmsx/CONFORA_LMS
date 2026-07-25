# CONFORA REPO HEALTH 40 — Loader Rework Review

## RH39 findings addressed

| Finding | RH40 status |
|---------|-------------|
| Eager `readFileSync` at import time | **FIXED** |
| No placeholder allowlist on `fillTemplate` | **FIXED** (see fillTemplate review) |
| No leftover-placeholder checks | **FIXED** (see fillTemplate review) |

## Checks 11–18

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 11 | No top-level `readFileSync` / eager JSON parse | **PASS** | `readFileSync` only inside `loadPromptBundleLazy` via lazy `require('node:fs')` |
| 12 | fs access only when prompt requested | **PASS** | Import of module does not touch disk |
| 13 | In-memory cache | **PASS** | `Map<AiPromptIdV1, PromptBundle>`; cache-hit returns without re-read |
| 14 | Closed prompt IDs | **PASS** | `chat.educational`, `chat.support`, `question.generate`, `risk.suggest`, `default` |
| 15 | Unknown ID fails closed | **PASS** | Throws; no silent `default` fallback |
| 16 | No arbitrary caller path input | **PASS** | API takes `purpose: string` ID only |
| 17 | Filename from allowlist | **PASS** | `` `${id}.json` `` after `isAiPromptIdV1` |
| 18 | Path traversal blocked | **PASS** | ID must be exact allowlist member; no `..`, no absolute paths |

## Implementation anchors

- `AI_PROMPT_IDS_V1` + `PROMPT_ID_SET` — closed set
- `getPromptBundleV1` — reject unknown before load
- `loadPromptBundleLazy` — join(`promptsDir()`, `${id}.json`) only
- `assertPromptBundle` — validates shape and `purpose === expectedId`

## Verdict

**lazy_load_pass:** true · **closed_prompt_ids_pass:** true · **path_traversal_blocked:** true · **eager_fs_removed:** true
