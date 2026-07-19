# CONFORA-REPO-HEALTH-5 — Ignore pattern review

## Proposed patterns (narrowness check)

| Pattern | Matches intended? | Too broad? | Notes |
|---------|:-----------------:|:----------:|-------|
| `package-lock.json` | yes (any depth) | low | Acceptable under pnpm-only policy; ignores nested stubs too |
| `apps/api/build-log*.txt` | yes | no | Scoped to API build logs only |
| `scripts/ops/_tmp-repo-health-*.mjs` | yes | no | Does **not** ignore real ops runners |
| `*.tsbuildinfo` | yes | low | Standard TS incremental files |
| `**/*.tsbuildinfo` | yes | low | Redundant with `*.tsbuildinfo` in gitignore but harmless clarity |

## Explicitly rejected broad patterns

| Pattern | Why rejected |
|---------|--------------|
| `apps/` | Would hide Nest source |
| `frontend-app/` | Would hide SPA source |
| `scripts/` or `scripts/ops/` | Would hide real ops runners |
| `packages/` | Would hide shared packages |
| `docs/` or `docs/evidence/` | Evidence must remain visible for selective commit |

## Expected status impact if applied later

Approximately **9** current untracked paths would disappear from `git status` (listed in candidates doc). Remaining ~1646 untracked entries would still be real source/docs/evidence — expected.
