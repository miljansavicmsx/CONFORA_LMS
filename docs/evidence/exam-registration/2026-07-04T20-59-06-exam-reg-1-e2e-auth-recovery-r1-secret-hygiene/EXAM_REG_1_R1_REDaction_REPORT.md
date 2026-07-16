# EXAM-REG-1 R1 Redaction Report

## Targets

| Path | Action |
|------|--------|
| `.../2026-07-04T20-59-06-exam-reg-1-e2e-auth-recovery/summary.json` | Redacted (PASS evidence) |
| `.../2026-07-04T20-39-38-exam-reg-1-e2e-auth-recovery/summary.json` | Redacted (prior FAIL run, same token leak) |

## Removed fields

- `readiness.keycloak.accessToken`
- `readiness.nestLogin.accessToken`
- `readiness.nestLogin.refreshToken`
- `readiness.apiMe.profile` (replaced with presence/validation booleans)

## Replacement fields

- `accessTokenPresent: true`
- `refreshTokenPresent: true` (nestLogin)
- `profileValidated` / `rolePresent` on `apiMe`
- Top-level: `tokens_committed: false`, `passwords_committed: false`, `secrets_committed: false`

## Verdict integrity

Prior functional verdict `EXAM_REG_1_E2E_CONFIRMED` remains valid: redaction removes secrets only; does not alter Playwright/auth outcomes recorded in that run.
