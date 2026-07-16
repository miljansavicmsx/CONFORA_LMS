# A-02-R3 — Secret Hygiene Review

## TD-085-S17-R1A (confirmed)

| Item | Value |
|------|-------|
| Evidence | `docs/evidence/td-085-sequential-regression/2026-07-16T10-15-12-td-085-s17-r1a-secret-hygiene/` |
| Commit | `90c1843` |
| Prior commit referenced | `119a117` |
| Changed file | `scripts/ops/run-f5-3-data-readiness-check.mjs` |
| Verdict | `TD_085_S17_R1A_GO_SECRET_HYGIENE_RESTORED` |

## Removed fallbacks

| Variable | Before | After |
|----------|--------|-------|
| `PILOT_USER_PASSWORD` | `?? 'PilotTest!2026'` | `requireEnv('PILOT_USER_PASSWORD')` |
| `KEYCLOAK_ADMIN_PASSWORD` | `?? 'admin_dev_change_me'` | `requireEnv('KEYCLOAK_ADMIN_PASSWORD')` |

## Validation

| Check | Result |
|-------|--------|
| Hardcoded password fallbacks removed | **true** |
| Secret pattern scan | **PASS** (no matches for removed literals) |
| Missing-env fail-safe | Exit 1 with variable **name only** |
| Secrets / tokens / passwords committed | **false** |

## Scope note

Ops-script secret hygiene only. No production API/Prisma/migration changes. Does not constitute security delegate signoff.
