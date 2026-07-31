# Lockfile importer analysis

**Evidence class:** lockfile state (`pnpm-lock.yaml` lockfileVersion `9.0`).

Importer count: **17**.

| Importer | Status | Tracked manifest | R0-7B2 disposition |
|----------|--------|------------------|--------------------|
| `.` | `TRACKED` | `package.json` | `REGENERATE_FROM_TRACKED` |
| `apps/admin` | `NO_TRACKED_MANIFEST` | `None` | `MUST_DISAPPEAR_UNTRACKED_OR_STALE` |
| `apps/api` | `TRACKED` | `apps/api/package.json` | `REGENERATE_FROM_TRACKED` |
| `apps/examiner` | `NO_TRACKED_MANIFEST` | `None` | `MUST_DISAPPEAR_UNTRACKED_OR_STALE` |
| `apps/web` | `NO_TRACKED_MANIFEST` | `None` | `MUST_DISAPPEAR_UNTRACKED_OR_STALE` |
| `apps/worker` | `NO_TRACKED_MANIFEST` | `None` | `MUST_DISAPPEAR_UNTRACKED_OR_STALE` |
| `packages/ai-client` | `TRACKED` | `packages/ai-client/package.json` | `REGENERATE_FROM_TRACKED` |
| `packages/ai-prompts` | `TRACKED` | `packages/ai-prompts/package.json` | `REGENERATE_FROM_TRACKED` |
| `packages/audit-client` | `TRACKED` | `packages/audit-client/package.json` | `REGENERATE_FROM_TRACKED` |
| `packages/config` | `TRACKED` | `packages/config/package.json` | `REGENERATE_FROM_TRACKED` |
| `packages/database` | `NO_TRACKED_MANIFEST` | `None` | `MUST_DISAPPEAR_UNTRACKED_OR_STALE` |
| `packages/i18n` | `TRACKED` | `packages/i18n/package.json` | `REGENERATE_FROM_TRACKED` |
| `packages/notification-templates` | `TRACKED` | `packages/notification-templates/package.json` | `REGENERATE_FROM_TRACKED` |
| `packages/sdk` | `TRACKED` | `packages/sdk/package.json` | `REGENERATE_FROM_TRACKED` |
| `packages/shared-kernel` | `TRACKED` | `packages/shared-kernel/package.json` | `REGENERATE_FROM_TRACKED` |
| `packages/shared-types` | `TRACKED` | `packages/shared-types/package.json` | `REGENERATE_FROM_TRACKED` |
| `packages/ui` | `TRACKED` | `packages/ui/package.json` | `REGENERATE_FROM_TRACKED` |

## Explicit inspections

| Item | Finding |
|------|---------|
| `jsqr` | Present in root lockfile importer; **absent** from tracked root `package.json` |
| `pngjs` | Present in root lockfile importer; **absent** from tracked root `package.json` |
| Untracked `apps/*` importers | `apps/admin`, `apps/web`, `apps/worker`, `apps/examiner` — no tracked manifest |
| `packages/database` importer | Present; no tracked manifest (OD-R07-2) |
| `frontend-app` | Tracked manifest **without** lockfile importer |
| `apps/api` | Tracked + importer present |
| Tracked packages | All 10 tracked `packages/*` have importers |

Do not manually edit the lockfile in R0-7B1.
