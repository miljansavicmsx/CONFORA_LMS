# CONFORA-REPO-HEALTH-1 — Tracked / Untracked / Modified

## Tracked files (705)

Top-level distribution of `git ls-files`:

| Top-level | Tracked files |
|-----------|--------------:|
| `docs/` | 511 |
| `frontend-app/` | 99 |
| `packages/` | 51 |
| `scripts/` | 31 |
| `apps/` | 12 |
| `package.json` | 1 |
| **Total** | **705** |

Interpretation: the branch’s tracked surface is a **narrow slice** (mostly selected docs/evidence + some frontend/packages/scripts/apps files), not the full monorepo tree present on disk.

## Modified tracked files (8)

| Path | Status |
|------|--------|
| `frontend-app/e2e/pilot-login.ts` | modified |
| `frontend-app/src/components/layout/sidebar-sections.tsx` | modified |
| `frontend-app/src/pages/dashboard/dashboard-breadcrumbs.ts` | modified |
| `packages/i18n/locales/bs/navigation.json` | modified |
| `packages/i18n/locales/sl/navigation.json` | modified |
| `packages/i18n/locales/sr/navigation.json` | modified |
| `scripts/ops/local-stack-readiness.mjs` | modified |
| `scripts/ops/run-exam-reg-1-e2e-auth-recovery.mjs` | modified |

These are **out of scope for auto-commit** in this hygiene task.

## Untracked status entries (1674)

Porcelain classification at audit time:

| Index status | Count |
|--------------|------:|
| `??` untracked | 1674 |
| ` M` modified | 8 |
| **Total status entries** | **1682** |

### Untracked by top-level folder / entry

| Count | Top-level |
|------:|-----------|
| 708 | `docs/` |
| 460 | `frontend-app/` |
| 245 | `scripts/` |
| 194 | `apps/` |
| 21 | `packages/` |
| 1 each | many root configs / tooling (`.github`, `.cursor`, `.tools`, `.local-backups`, `docker-compose.yml`, lockfiles, `tmp-keycloak-setup-output.txt`, screenshot, etc.) |

### Untracked breakdown (selected)

**docs/**

| Sub-area | Untracked entries (approx) |
|----------|---------------------------:|
| `docs/evidence/` | 411 |
| Many individual `docs/*.md` policy/ops docs | ~290+ |

**docs/evidence domains (largest untracked)**

| Domain | Untracked entries |
|--------|------------------:|
| `f5-pilot-readiness` | 240 |
| `admin-governance-final-acceptance` | 31 |
| `external-pilot-technical-readiness` | 29 |
| `learner-final-acceptance` | 26 |
| `legal-gdpr` | 14 |
| `appeals-complaints` | 8 |
| others | smaller / 1 each |

**frontend-app/**

| Sub-area | Untracked entries |
|----------|------------------:|
| `src/` | 394 |
| `e2e/` | 55 |
| config files | handful |

**scripts/**

| Sub-area | Untracked entries |
|----------|------------------:|
| `ops/` | 195 |
| assorted root scripts | ~50 |

**apps/**

| Sub-area | Untracked entries |
|----------|------------------:|
| `api/` | 189 |
| other app roots (`web`, `worker`, …) | 1 each as top status lines |

## Tracked vs untracked tension

| Area | Tracked | Untracked entries |
|------|--------:|------------------:|
| `docs/evidence` | 511 files | 411 status entries |
| `frontend-app` | 99 | 460 |
| `apps` | 12 | 194 |

This is the primary hygiene/process risk: **local completeness >> remote tracked set**, so `git status` stays noisy and accidental `git add .` would be catastrophic.
