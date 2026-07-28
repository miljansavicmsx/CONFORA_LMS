# Independent lockfile semantic review

## Importers

| Metric | Value |
|--------|-------|
| Before | 17 |
| After | 12 |
| Removed | `apps/admin`, `apps/web`, `apps/worker`, `apps/examiner`, `packages/database` |
| Unexpected remaining | 0 |
| `frontend-app` importer | Absent (correct) |

## Package snapshot churn

| Metric | Approximate |
|--------|-------------|
| `packages:` entries | 1629 → 1370 (−259, +0) |
| Integrity delta | Removal-dominated |

Churn is proportionate to stale-importer tree removal plus root drift
correction under pnpm `9.14.2`. No unexplained additive package set.

## Root drift

| Package | Finding |
|---------|---------|
| `jsqr` | `ABSENT` from new lockfile |
| `pngjs` | Direct root entry removed; transitive `pngjs@5.0.0` retained via `qrcode@1.5.4` (`apps/api`) |

## Workspace references

Unresolved `workspace:` references to untracked packages: **0**.
