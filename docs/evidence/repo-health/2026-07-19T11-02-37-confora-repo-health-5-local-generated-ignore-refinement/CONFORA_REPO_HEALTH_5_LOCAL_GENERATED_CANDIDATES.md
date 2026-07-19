# CONFORA-REPO-HEALTH-5 — Local / generated candidates

All of the following are **untracked** and **not** currently matched by root `.gitignore` (`git check-ignore` → not ignored).

## Safe ignore candidates

| Path | Class | Why safe |
|------|-------|----------|
| `package-lock.json` | generated / local-only | Empty npm stub; repo is pnpm-only (RH4) |
| `frontend-app/package-lock.json` | generated / local-only | Nested npm lock stub; same policy |
| `apps/api/build-log.txt` | local build log | Regenerable / noise |
| `apps/api/build-log2.txt` | local build log | Regenerable / noise |
| `scripts/ops/_tmp-repo-health-3-classify.mjs` | temp audit helper | RH3 classifier; not product |
| `scripts/ops/_tmp-repo-health-3-emit.mjs` | temp audit helper | RH3 emitter |
| `scripts/ops/_tmp-repo-health-4-analyze.mjs` | temp audit helper | RH4 analyzer |
| `scripts/ops/_tmp-repo-health-4-emit.mjs` | temp audit helper | RH4 emitter |
| `packages/shared-types/tsconfig.build.tsbuildinfo` | TS incremental cache | Standard build artifact |

## Review before ignore

| Item | Note |
|------|------|
| Broader `**/*.log` under apps | Root already has `*.log`; `.txt` build logs need explicit pattern |
| Future `_tmp-*.mjs` outside `scripts/ops/_tmp-repo-health-*` | Keep pattern scoped to repo-health helpers only |

## Already ignored by existing `.gitignore` (examples)

| Pattern area | Examples |
|--------------|----------|
| Dependencies | `node_modules/`, `**/node_modules/` |
| Build/cache | `dist/`, `apps/**/dist/`, `.turbo/`, `.cache/`, `frontend-app/dist/` |
| Local tooling | `.tools/`, `.local-backups/`, `**/.venv/` |
| Secrets/local dumps | `.env`, `.env.local`, `tmp-keycloak-setup-output.txt`, root QR screenshots |
| Playwright | `test-results/`, `playwright-report/` |

No change proposed to those — R2 is additive only.
