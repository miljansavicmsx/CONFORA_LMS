# Baseline failure attribution

Baseline failure count: **5** (docker SKIPPED, not counted as failure).

| Check | Exact cause | PR-caused? |
|-------|-------------|------------|
| quality | `@confora/shared-kernel#lint` — ESLint `@typescript-eslint/no-unnecessary-condition` / `no-unnecessary-type-assertion` | **No** — PR diff does not touch `packages/shared-kernel` |
| database | Job working directory `packages/database` missing (`No such file or directory`); `packages/database` not tracked at integration tip `4090be85…` | **No** |
| compliance-iso | Same missing `packages/database` working directory | **No** |
| accessibility | Missing modules `tools/a11y/contrast-check.ts`, `scripts/a11y/*.mjs` (not present at integration tip) | **No** |
| f4-frontend-cutover | Missing `scripts/ops/run-f4-8g-frontend-validation.mjs` — absent at both integration tip and PR tip | **No** |

Complaint/auth paths changed by this slice (`auth-token-provider`, complaints client/UI, focused vitest config) did not appear as the failing step root cause in any check log.

PR-caused blocking check failure count: **0**.
