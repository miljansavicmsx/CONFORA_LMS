# RB-01 — Local Keycloak browser sign-in

Local synthetic start for PostgreSQL, Keycloak 26, the Nest API, and the Vite frontend. This is not a production deployment. Production use remains unauthorized until an independent security review records a GO for a specific commit.

## Session mechanism

The browser uses Authorization Code + PKCE (S256) against realm `confora`, client `confora-web`. The API is the backend-for-frontend:

- The browser stores an opaque session id in cookie `confora_sid` (`HttpOnly`, `Secure` by default, `SameSite=Lax`, `Path=/v1`).
- Access, refresh, and id tokens stay in the API process memory. They are not written to `localStorage` or `sessionStorage`, and they are not returned by `GET /v1/auth/session`.
- Each API request copies the current access token into `Authorization` only when the caller did not already send one. The existing JWT strategy still checks RS256, issuer, audience, JWKS, and expiry.
- A missing `OIDC_SESSION_SECRET` disables this browser flow. It does not accept a password grant or a fake token.
- Idle lifetime defaults to 1800 seconds and absolute lifetime to 28800 seconds. An expired session is deleted, its refresh token is revoked, and the next request is rejected. The login page then asks Keycloak for `prompt=login`, so an existing Keycloak SSO cookie cannot silently recreate the CONFORA session.
- Logout revokes the refresh token and returns Keycloak's end-session URL. That URL contains `id_token_hint` because the OIDC logout specification requires it. Do not log it and do not capture it in a screenshot.
- Restarting the API drops in-memory sessions. The person signs in again. This is a single-process local store.

`SESSION_COOKIE_SECURE=true` is the default. Chromium treats `http://localhost` as a secure context, so use `localhost` for the API, Keycloak, and the frontend. Do not mix `localhost` and `127.0.0.1`.

## Role and organization mapping

Keycloak realm roles use the existing 19 CONFORA role identifiers. The API still resolves `tenant_id` plus issuer plus `sub` through `ExternalIdentityLink`. There is no just-in-time user creation. A missing, non-UUID, or unmatched organization claim is denied.

The RBAC enum has no separate chair identifier. `exam-committee-chair` is a second `COM_CERT` user and is not assigned to the demo case. `exam-approver` is `COM_TECH`. The issuer is `ISSUANCE_OFFICER` and `LIFECYCLE_OFFICER` only. Learner document reads already require MFA, so the synthetic candidate has a TOTP credential. Privileged users also have TOTP. The AMR claim comes from the Keycloak authenticator reference (`otp` / `pwd`). `mfa_verified=true` is not hardcoded.

Realm export `infra/keycloak/realm/confora-realm-v1.json` has no passwords. `sslRequired=none` and brute-force protection disabled apply only to this local realm.

## Linux

From the repository root, with Node 22, pnpm, and PostgreSQL 16:

```bash
chmod +x scripts/local/*.sh
bash scripts/local/setup.sh
export KEYCLOAK_HOME=/path/to/keycloak-26.0.7
bash scripts/local/start.sh
```

`setup.sh` creates `.secrets/local.env` (mode 600), the database role, the frontend env, and the migrated synthetic data. `start.sh` starts Keycloak on port 18080, imports the realm, provisions users, then starts the API on port 4000 and the frontend on port 3001.

Stop with `bash scripts/local/stop.sh`.

To watch idle expiry on this same code path, start the API with a shorter idle value. Do not change the default in the secrets file:

```bash
export OIDC_SESSION_IDLE_SECONDS=12
export KEYCLOAK_HOME=/path/to/keycloak-26.0.7
bash scripts/local/start.sh
```

## Windows 11 PowerShell

Docker Desktop is the Windows path. From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/local/setup.ps1
docker compose --env-file .secrets/local.env -f infra/docker/docker-compose.local.yml up -d
node scripts/local/oidc-local.mjs migrate-seed
powershell -ExecutionPolicy Bypass -File scripts/local/start.ps1
```

`start.ps1` waits for Keycloak, imports the realm, provisions users, and starts the API and Vite. The published Postgres port follows `POSTGRES_PORT` (5432 in the generated file, 15432 if you change it before compose starts). Stop with `scripts/local/stop.ps1`.

Open `http://localhost:3001/login`. The button goes to Keycloak. After sign-in the profile is `http://localhost:3001/dashboard/profil`.

Passwords and OTP secrets are only in `.secrets/`. Do not print that file, do not commit it, and do not include tokens, passwords, or the Keycloak logout URL in screenshots.
