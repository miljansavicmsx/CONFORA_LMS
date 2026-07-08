# LOCAL_PILOT_FINAL_ROLLUP_1 Startup Runbook

Corrected local pilot startup procedure (lessons learned from acceptance recovery sessions).

## A. Docker infrastructure

```powershell
npm run docker:up
```

Expected: PostgreSQL on `localhost:15432`, Keycloak on `localhost:18080`.

## B. API with pilot environment

**Do not** start the API with raw `pnpm --dir apps/api run dev` alone.

Without pilot env, startup fails:

> `KEYCLOAK_JWKS_URI is required when AUTH_JWT_MODE is not hs256`

Use:

```powershell
npm run dev:api:pilot
```

This loads `scripts/ops/staging-pilot-api.env.example` (JWKS URI, tenant, auth mode).

API expected: `http://localhost:4000/health` → 200

## C. Frontend

```powershell
cd frontend-app
pnpm dev -- --host 0.0.0.0 --port 3001
```

Frontend expected: `http://localhost:3001/` → 200

## D. Required environment for smokes / acceptance

```powershell
$env:POSTGRES_DOCKER_CONTAINER = "docker-postgres-1"
$env:POSTGRES_DB = "confora"
$env:PLAYWRIGHT_PILOT_PASSWORD = "PilotTest!2026"
$env:PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH = "cedf36de04cb8d9866451349199e9861a4641c31bb48ea78c65cdf1eae6a7945"
```

Verify hash must exist in `cert.certificates` (ACTIVE/ISSUED) for S17 public verification.

## E. Smoke / acceptance commands (after stack UP)

```powershell
npm run audit:f4-frontend-api
npm run ops:f5-3-data-readiness
npm run ops:f5-5-security-gdpr-audit
npm run ops:f4-9-smoke
npm run ops:s17-public-verify-browser
npm run ops:admin-gov-final-acceptance-1
npm run ops:learner-final-acceptance-1
```

## F. Common failure modes

| Symptom | Cause | Fix |
|---------|-------|-----|
| API won't start | Missing KEYCLOAK_JWKS_URI | Use `dev:api:pilot` |
| S17 FAIL | Frontend down or missing verify hash | Start FE on :3001; set hash env |
| Playwright BLOCKED_STACK_DOWN | API/FE/KC/PG not reachable | Complete steps A–C first |
| Learner education timeout | Page shell wait under load | Use LEARNER-FINAL-ACCEPTANCE-1R harness |

**Startup runbook status:** DOCUMENTED_AND_VALIDATED
