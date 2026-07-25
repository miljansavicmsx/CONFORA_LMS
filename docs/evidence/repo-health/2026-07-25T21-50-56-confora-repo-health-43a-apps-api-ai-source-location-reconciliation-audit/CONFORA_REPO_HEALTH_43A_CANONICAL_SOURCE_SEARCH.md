# CONFORA REPO HEALTH 43A — Canonical Source Search

## 1. Tracked-only (`git grep`)

```text
git grep -n "getPromptBundleV1|fillTemplate|fillPromptUserTemplateV1|AiPurpose|question.explain|content.draft|analysis.exam_result" -- apps/api packages frontend-app
```

### Hits in tracked tree

| Location | Notes |
|----------|--------|
| `packages/ai-prompts/src/index.ts` | Package definitions (loader) |
| `packages/ai-prompts/src/index.test.ts` | Tests; `question.explain` as **reject** case |

### apps/api tracked

**Zero hits** (`git grep` scoped to `apps/api` exit 1).

**tracked_get_prompt_bundle_callers_found:** `[]`  
**tracked_ai_purpose_values_found:** `[]` (no apps/api tracked usages; `packages/ai-client` is **entirely untracked**, count 0)

## 2. Working-tree source excluding generated

Search under `apps/api`, `packages`, `frontend-app` excluding `dist/**`, `coverage/**`, `node_modules/**`, `.turbo/**`.

### Result

- `packages/ai-prompts/**` — tracked package (as above)  
- `packages/ai-client/**` — **untracked** package source with `AiPurpose` / non-closed purposes  
- **No** `apps/api/src/ai/**`, `course-authoring/**`, or `exam/**` TypeScript on disk  

Manual follow-up claim confirmed: excluding dist/coverage/node_modules, no apps/api **source** callers for `getPromptBundleV1` / those purpose strings.

## 3. Generated/stale (separate)

See GENERATED_STALE_ARTIFACT_REVIEW — hits in `apps/api/dist/**` and `apps/api/coverage/**`.
