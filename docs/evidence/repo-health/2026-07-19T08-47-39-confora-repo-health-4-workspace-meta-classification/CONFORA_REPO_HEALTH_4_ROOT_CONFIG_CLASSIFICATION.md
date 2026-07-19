# Root config classification

| Path | Class | Rationale |
|------|-------|-----------|
| `.editorconfig` | **recommended to track now** | Shared editor basics |
| `.env.example` | **recommended to track now** | Placeholder template only (see env review) |
| `.prettierignore` | **recommended to track now** | Format pipeline |
| `.lighthouserc.json` | **recommended to track now** | A11y CI config referenced by scripts |
| `eslint.config.mjs` | **recommended to track now** | Lint root |
| `prettier.config.cjs` | **recommended to track now** | Format root |
| `commitlint.config.cjs` | **recommended to track now** | Commit-msg husky hook |
| `turbo.json` | **recommended to track now** | Turborepo tasks used by package.json |
| `pnpm-workspace.yaml` | **recommended to track now** | Workspace definition |
| `pnpm-lock.yaml` | **recommended to track now** | Canonical lockfile for `packageManager: pnpm@9.14.2` |
| `README.md` | **recommended to track now** | Entry + governance pointers |
| `AGENTS.md` | **recommended to track now** | Agent Baseline instructions |
| `.github/` | **recommended to track now** | CI workflows (8 files) |
| `.husky/` | **recommended to track now** | pre-commit / commit-msg |
| `.cursorignore` | **review before tracking** | Useful for Cursor; adjacent to ignored `.cursor/` — confirm team wants it shared |
| `docker-compose.yml` | **review before tracking** | Explicit **LEGACY** stack; canonical is `infra/docker` |
| `docker-compose.a11y-ci.yml` | **review before tracking** | Legacy a11y CI compose subset |
| `test-all.ps1` / `test-all.sh` | **review before tracking** | Legacy FastAPI/Playwright local runners |
| `package-lock.json` | **local-only / do not track** | Empty npm stub (`packages: {}`); do not dual-lock |

## Counts for summary

- recommended_track_now: 14
- review_before_tracking: 14 (includes root governance docs listed separately)
- local_only_do_not_track: 1
