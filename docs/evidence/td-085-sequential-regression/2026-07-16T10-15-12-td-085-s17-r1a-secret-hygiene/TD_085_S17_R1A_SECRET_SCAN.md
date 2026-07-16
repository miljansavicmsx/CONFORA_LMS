# TD-085-S17-R1A Secret Scan

**Target:** `scripts/ops/run-f5-3-data-readiness-check.mjs`  
**Scan time:** 2026-07-16T10:15:12+02:00

## Pattern scan results

| Pattern | Result |
|---------|--------|
| `PilotTest!2026` | **no matches** |
| `admin_dev_change_me` | **no matches** |
| `PILOT_USER_PASSWORD ??` | **no matches** |
| `KEYCLOAK_ADMIN_PASSWORD ??` | **no matches** |

## Required-env confirmation

| Variable | Binding |
|----------|---------|
| `PILOT_USER_PASSWORD` | `requireEnv('PILOT_USER_PASSWORD')` at line 29 |
| `KEYCLOAK_ADMIN_PASSWORD` | `requireEnv('KEYCLOAK_ADMIN_PASSWORD')` at line 37 |

## Safe-failure verification

| Test | Expected | Observed |
|------|----------|----------|
| No env vars set | Exit 1, name-only error | `Missing required environment variable: PILOT_USER_PASSWORD` |
| Only `PILOT_USER_PASSWORD` set | Exit 1, name-only error | `Missing required environment variable: KEYCLOAK_ADMIN_PASSWORD` |

No password, token, cookie, or admin credential values were printed or written to evidence.

## Verdict

**PASS** — hardcoded password fallbacks removed from changed file.
