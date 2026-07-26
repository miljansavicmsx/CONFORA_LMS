# CONFORA REPO HEALTH 46 — Generated / Vendor Review

## Import exclusion verified

Commit `f2270fdf` and current `git ls-files packages/ai-client` contain **no** generated or vendor artifacts.

| Path | On disk | Tracked | Status |
|------|:-------:|:-------:|--------|
| `packages/ai-client/src/index.d.ts` | yes | **no** | DO_NOT_IMPORT (excluded) |
| `packages/ai-client/src/index.js` | yes | **no** | DO_NOT_IMPORT (excluded) |
| `packages/ai-client/src/index.js.map` | yes | **no** | DO_NOT_IMPORT (excluded) |
| `packages/ai-client/tsconfig.build.tsbuildinfo` | yes | **no** | DO_NOT_IMPORT (gitignored) |
| `packages/ai-client/dist/**` | yes | **no** | DO_NOT_IMPORT |
| `packages/ai-client/node_modules/**` | yes | **no** | DO_NOT_IMPORT |
| `packages/ai-client/.turbo/**` | yes | **no** | DO_NOT_IMPORT |

`generated_or_vendor_artifacts_tracked: false`  
`packages_ai_client_generated_untracked: true`

## Residual hygiene note (non-blocking)

Stray compiled files remain on disk inside `src/` and are still not covered by ignore rules for `.js`/`.d.ts`/`.map`. Import correctly excluded them. Future accidental staging risk remains if someone runs `git add packages/ai-client/` or `git add packages/ai-client/src/` — hygiene cleanup (delete or widen ignore) remains a separate deferred task. RH46 did not delete anything.

## Standing exclusions reaffirmed

- 3 deferred HR MJML templates (untracked)
- `apps/api/dist/**`, `apps/api/coverage/**`, other generated/stale artifacts
