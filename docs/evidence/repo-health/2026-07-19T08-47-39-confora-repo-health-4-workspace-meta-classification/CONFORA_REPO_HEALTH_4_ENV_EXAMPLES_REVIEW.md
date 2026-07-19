# Env examples review

**No secret values reproduced.**

| File | Keys | Placeholder mentions | JWT/otpauth/private-key patterns | Suspicious long non-placeholder keys |
|------|-----:|---------------------:|----------------------------------:|--------------------------------------:|
| `.env.example` | 40 | 22 | none | 0 |
| `frontend-app/.env.example` | 11 | 9 | none | 0 |

## Assessment

- Root `.env.example`: local-dev placeholders (`*_change_me`, localhost ports, Keycloak/MinIO/Postgres scaffolding). Suitable to **track** as a template.
- `frontend-app/.env.example`: Vite `VITE_*` placeholders; out of RH4 commit scope unless included later with frontend wave — still **safe template** class.
- Do **not** track real `.env` / `.env.local` (already ignored).

## Classification

| Path | Class |
|------|-------|
| `.env.example` | recommended to track now |
| `frontend-app/.env.example` | review with frontend source wave (not this meta commit unless explicitly desired) |
