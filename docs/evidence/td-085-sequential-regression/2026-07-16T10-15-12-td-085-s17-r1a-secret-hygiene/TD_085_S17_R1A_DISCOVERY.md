# TD-085-S17-R1A Discovery — Secret Hygiene

**Task:** TD-085-S17-R1A  
**Prior baseline:** `TD_085_S17_R1_GO_LOCAL_BASELINE_RESTORED`  
**Prior commit (R1 fix):** `119a117`  
**Branch:** `fix/ca-h01-frontend-f4-cutover`

## Finding

Secret scan flagged hardcoded password fallback values in the F5-3 pilot data readiness ops script:

| Location | Pattern | Risk |
|----------|---------|------|
| `scripts/ops/run-f5-3-data-readiness-check.mjs:19` | `process.env.PILOT_USER_PASSWORD ?? 'PilotTest!2026'` | Committed pilot credential default |
| `scripts/ops/run-f5-3-data-readiness-check.mjs:27` | `process.env.KEYCLOAK_ADMIN_PASSWORD ?? 'admin_dev_change_me'` | Committed Keycloak admin credential default |

## Scope

- **In scope:** Remove password fallbacks; require env-only sourcing with safe failure.
- **Out of scope:** Prisma schema, migrations, API contracts, MFA/RBAC/privacy logic changes.
- **Not claimed:** external pilot approval, security delegate signoff, DPO/legal signoff, real personal data approval, staging/production validation.

## Residual note (non-password)

`KEYCLOAK_ADMIN` retains a username default (`admin`) — not a password secret. `MFA_TEST_TOTP_SECRET` retains a test TOTP seed default; not in R1A password-fallback scope.
