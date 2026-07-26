# CONFORA REPO HEALTH 46 — Status Baseline

| # | Check | Result |
|---|-------|--------|
| 1 | HEAD is `f2270fdf` | **PASS** — `f2270fdf8fe4ec0bfb7ab2af528d3b8e57e0db4c` |
| 2 | Remote contains HEAD | **PASS** — `origin/fix/ca-h01-frontend-f4-cutover` same SHA |
| 3 | Nothing staged | **PASS** — `STAGED_COUNT=0` before and after |
| 4 | Tracked working tree clean (content) | **PASS** — see note |
| 5 | `packages/ai-client` exactly 5 tracked files | **PASS** |
| 6 | Generated artifacts untracked | **PASS** — `index.d.ts`, `index.js`, `index.js.map` exist on disk, not tracked |
| 7 | `packages/ai-prompts` clean | **PASS** |
| 8 | `apps/api` clean | **PASS** |
| 9 | `packages/i18n` and `packages/ui` clean | **PASS** |
| 10 | notification-templates: only 3 deferred HR MJML | **PASS** |

## Tracked-tree note

`git status --porcelain -uno` still lists prior `docs/evidence` packs as `M`. Sample content identity check:

```text
sample_same=5 sample_diff=0
```

Line-ending/stat porcelain noise only; no tracked content change. RH46 writes only inside its own evidence folder.

## Tracked `packages/ai-client` files

```text
packages/ai-client/package.json
packages/ai-client/src/index.ts
packages/ai-client/src/metadata.test.ts
packages/ai-client/tsconfig.build.json
packages/ai-client/tsconfig.json
TRACKED_COUNT=5
```

## Deferred HR MJML (unchanged)

- `packages/notification-templates/templates/events/audit.integrity.failed/v1/hr.mjml`
- `packages/notification-templates/templates/events/report.mr_monthly_digest/v1/hr.mjml`
- `packages/notification-templates/templates/standard/v1/hr.mjml`

## Lineage

RH45 audit (`1b9179ae`) → import commit `f2270fdf` → **RH46 verification**.
