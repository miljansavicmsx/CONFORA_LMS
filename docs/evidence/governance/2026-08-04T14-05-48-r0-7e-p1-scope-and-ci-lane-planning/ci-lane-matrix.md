# Proposed CI Lane Matrix

| Lane | Authority and expected inputs | Proposed commands | Current status and blockers | Allowed outcome | Prohibited claim | Exit criteria |
|---|---|---|---|---|---|---|
| Canonical tracked workspace | Root package.json, pnpm-workspace.yaml, pnpm-lock.yaml, tracked workspace manifests and source only | pnpm install --frozen-lockfile; declared package lint, typecheck, unit | Partial: root install evidence exists; quality fails in packages/ai-prompts; apps/api incomplete | Green only for explicit allowlisted tracked executable packages; blockers reported | Complete platform, backend, database, or repository health | Clean-clone allowlist passes and exclusions are machine-readable |
| Transitional frontend | frontend-app/** and its tracked file dependencies | Future approved deterministic install; npm run lint:all; focused tests; build only after lock authority | Standalone outside root workspace; no tracked lockfile; focused complaint tests exist; full build unverified; R0-7D open | Focused pass or explicit blocked install/build | Fully canonical frontend, production readiness, clean-clone build before proof | R0-7D establishes lock/dependency authority, build, and accessibility |
| Legacy | Tracked legacy authority only; backend/** currently has zero tracked files | No default command | Absent and frozen legacy | Explicit exclusion with reason | Passing legacy implementation or FastAPI canonicality | Separate owner decision and frozen-legacy task |
| Missing authority | packages/database/**, tools/a11y/**, scripts/a11y/**, F4 validator, missing apps/api modules, missing frontend auth authority, missing TECH_DEBT.md | No implementation command until separately authorized | Absent or incomplete | Fail closed, block, or explicit skip | Green implementation lane, inferred local authority, ISO conformity | Separate recovery, tracked source, tests, evidence, review, merge |

Every lane must print authority, included targets, exclusions, and claim
boundaries. Missing targets must not be silently filtered into green.
