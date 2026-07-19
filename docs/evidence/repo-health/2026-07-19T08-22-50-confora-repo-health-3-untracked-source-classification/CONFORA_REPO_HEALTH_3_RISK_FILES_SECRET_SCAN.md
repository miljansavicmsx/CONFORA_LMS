# Risk files & secret scan (paths/categories only)

**No secret values are reproduced in this report.**

## Path-name risk (untracked)

| Path | Why flagged |
|------|-------------|
| `apps/api/src/auth/jwt-hs256-secret.ts` | name heuristic (secret/screenshot/env-like) |
| `frontend-app/e2e/local-demo-4-screenshots.spec.ts` | name heuristic (secret/screenshot/env-like) |
| `frontend-app/e2e/local-uat-4-po-walkthrough-screenshots.spec.ts` | name heuristic (secret/screenshot/env-like) |

## Content pattern hits (identifier / template scan)

Scanned 1026 text-like untracked files (size-capped). Hits: **72** paths.

| Category | Count | Interpretation |
|----------|------:|----------------|
| `token_field` | 36 | Mostly source identifiers / env *names* in code; still human-review before commit |
| `client_secret_field` | 15 | Mostly source identifiers / env *names* in code; still human-review before commit |
| `otpauth_uri` | 2 | Mostly source identifiers / env *names* in code; still human-review before commit |
| `password_field` | 19 | Mostly source identifiers / env *names* in code; still human-review before commit |

### Higher-attention subset

| Path | Category | Guidance |
|------|----------|----------|
| `scripts/ops/keycloak-mfa-pkce-enrollment.mjs` | otpauth_uri | Ensure no live otpauth secrets committed; review before tracking |
| `scripts/ops/run-ep-tech-8-mfa-training-closure.mjs` | otpauth_uri | Same |
| `apps/api/build-log.txt` | token_field | Do not track build logs |
| `apps/api/src/auth/jwt-hs256-secret.ts` | path name | Review for hardcoded secrets before tracking |
| `frontend-app/e2e/*screenshots*.spec.ts` | path name | Specs OK potentially; generated screenshot binaries must stay ignored |

### Already mitigated by HEALTH-2 ignore (expected absent from status)

- `tmp-keycloak-setup-output.txt`
- root QR screenshots
- `.env` / `.env.local`
- `.tools/`, `.local-backups/`

## Verdict on secrets for this audit

- `secrets_committed: false` (this task commits nothing).
- Untracked tree still needs **spot review** before large tracking waves, especially MFA enrollment ops and auth modules.
