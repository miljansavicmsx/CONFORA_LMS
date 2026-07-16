# Auth diagnosis

| Check | Status |
|-------|--------|
| PostgreSQL :15432 | UP |
| Keycloak :18080 | UP |
| Nest API :4000 | UP |
| API /health | 200 OK |
| Frontend :3001 | UP |
| Keycloak token (pilot.learner@confora.test) | PASS |
| Nest /auth/login | PASS |
| Nest /auth/me | PASS |
| frontend-app/.env.local | nest pilot env present |
| env.local write | existing |

## Root cause hypothesis

Prior Playwright failures used `PLAYWRIGHT_NO_WEB_SERVER=1` against Vite on port 3001 **without** `frontend-app/.env.local`.
Default Vite auth provider is **legacy** (FastAPI :8000), so login never reached Nest/Keycloak and `waitForURL(/dashboard/)` timed out.

Recovery uses Playwright-managed Vite on port **3011** with `VITE_AUTH_PROVIDER=nest` injected via `playwright.config.ts`.

Detected root cause: **resolved — stack and auth ready**
