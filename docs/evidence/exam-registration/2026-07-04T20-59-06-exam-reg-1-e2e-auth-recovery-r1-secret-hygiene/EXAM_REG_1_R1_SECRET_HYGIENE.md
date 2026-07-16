# EXAM-REG-1-E2E-AUTH-RECOVERY-R1 — Secret Hygiene

| Field | Value |
|-------|-------|
| Based on | `docs/evidence/exam-registration/2026-07-04T20-59-06-exam-reg-1-e2e-auth-recovery/` |
| Verdict | `EXAM_REG_1_E2E_AUTH_RECOVERY_R1_GO_SECRET_HYGIENE_RESTORED` |

## Changes

1. `scripts/ops/local-stack-readiness.mjs`
   - Removed hardcoded pilot password and Keycloak client secret fallbacks
   - Requires `PLAYWRIGHT_PILOT_PASSWORD` or `PILOT_USER_PASSWORD`
   - Requires `KEYCLOAK_API_CLIENT_SECRET` or `KEYCLOAK_CLIENT_SECRET`
   - Probe results expose `accessTokenPresent` / `refreshTokenPresent` only (no token values)

2. `frontend-app/e2e/pilot-login.ts`
   - Removed hardcoded password fallback
   - Requires `PLAYWRIGHT_PILOT_PASSWORD`

3. Evidence redaction
   - Removed JWT access/refresh tokens from prior `summary.json`
   - Minimized `apiMe` to validation booleans (no full profile dump)

## Explicit non-claims

- tokens_committed: false
- passwords_committed: false
- secrets_committed: false
- No auth/RBAC/privacy/tenant/governance weakening
- Prior functional verdict `EXAM_REG_1_E2E_CONFIRMED` retained as valid after redaction
