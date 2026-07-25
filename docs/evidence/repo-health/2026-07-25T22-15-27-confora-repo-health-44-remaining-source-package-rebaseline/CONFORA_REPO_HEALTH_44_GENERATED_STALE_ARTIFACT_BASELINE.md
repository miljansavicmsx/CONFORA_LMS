# CONFORA REPO HEALTH 44 — Generated / Stale Artifact Baseline

## Present (do not treat as canonical source)

### apps/api

- `dist/**` — includes compiled AI gateway, course-authoring `content.draft`, exam-engine `analysis.exam_result`
- `coverage/**` — HTML mirrors of former/untracked `.ts` paths

### packages

- Multiple packages have on-disk `dist/`, `node_modules/`, `.turbo/` (gitignored via `packages/**/dist/`, `**/node_modules/`, `.turbo/`)

## Tracked vs generated AI search

| Scope | Result |
|-------|--------|
| Tracked source | Only `packages/ai-prompts` definitions/tests |
| `apps/api/dist` + `coverage` | Multiple hits (stale) |
| Treat as import/patch targets? | **No** |

## generated_or_stale_artifacts_present

**true**

## DO_NOT_IMPORT

`apps/api/dist/**`, `apps/api/coverage/**`, all `node_modules/**`, `.turbo/**`, `packages/**/dist/**`
