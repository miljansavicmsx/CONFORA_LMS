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
- `GET /v1/auth/session` returns a synchronizer `csrfToken` for that session only. The browser keeps it in page memory and sends it as `X-CSRF-Token` on cookie-authenticated `POST`, `PUT`, `PATCH`, and `DELETE`, including refresh and logout. The request must also carry an `Origin` or `Referer` in `OIDC_WEB_ORIGINS`. A missing, wrong, or other-session token is rejected and does not delete the session. CORS is not this control. `confora_sid` stays `HttpOnly`, `Secure`, and `SameSite=Lax`. The token is not an access token and must not appear in a screenshot.
- Restarting the API drops in-memory sessions. The person signs in again. This is a single-process local store.

`SESSION_COOKIE_SECURE=true` is the default. Chromium treats `http://localhost` as a secure context, so use `localhost` for the API, Keycloak, and the frontend. Do not mix `localhost` and `127.0.0.1`.

## Role and organization mapping

Keycloak realm roles use the existing 19 CONFORA role identifiers. The API still resolves `tenant_id` plus issuer plus `sub` through `ExternalIdentityLink`. There is no just-in-time user creation. A missing, non-UUID, or unmatched organization claim is denied.

OD-AUTH-31: `exam-approver` has no realm role. It is not mapped to `COM_TECH`. Confirming one exam's result is not demonstrable in this preview, and that future authority would not decide certification. OD-AUTH-32: `exam-committee-chair` has no realm role. `COM_CERT` is not chair authority, and this preview does not create an appointment. The signed-in denial page says chair actions are not implemented and does not open them. The issuer is `ISSUANCE_OFFICER` and `LIFECYCLE_OFFICER` only. Learner document reads already require MFA, so the synthetic candidate has a TOTP credential. Privileged users also have TOTP. The two accounts above have no privileged role, so they have no TOTP. The AMR claim comes from the Keycloak authenticator reference (`otp` / `pwd`). `mfa_verified=true` is not hardcoded.

`/unauthorized` is the page a signed-in guard already refused. `profil`, under the dashboard, is the P0 view of that person's courses, applications, and EDU/EXM documents. Each exists for that reason. The route contract does not grow so a count assertion can pass.

Realm export `infra/keycloak/realm/confora-realm-v1.json` has no passwords. `sslRequired=none` and brute-force protection disabled apply only to this local realm.

## Synthetic credentials and authenticator

`node scripts/local/oidc-local.mjs init-secrets` writes `.secrets/local.env` (mode 600). `setup.sh` and `setup.ps1` call that command. The file is gitignored. Do not print it, commit it, or put it in a screenshot.

- `DEMO_USER_PASSWORD` is the password for every synthetic user. Usernames are in `infra/keycloak/synthetic-users.json`.
- `OTP_SECRET_<USERNAME>` is the base32 TOTP seed. The candidate key is `OTP_SECRET_EXAM_CANDIDATE`. Hyphens in the username become underscores, and the name is upper case.
- `KEYCLOAK_ADMIN_PASSWORD` is only for local realm provisioning.

Keycloak already stores the same TOTP seed when users are provisioned. There is no QR enrolment screen. In an authenticator app, add the account by hand: TOTP, SHA1, 6 digits, 30-second period, and the base32 seed from `.secrets/local.env`. The Keycloak page then asks for the current code. The candidate and every privileged synthetic user need that code.

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

Prerequisites, installed before the scripts:

- Docker Desktop, running, so it can start PostgreSQL 16 and Keycloak 26.0.7
- Node.js 22
- pnpm 9.14.2 or newer

From the repository root, install dependencies and build the packages the API imports. `start.ps1` does not repeat this build. It does start compose, migrate and seed, import the realm, provision users, and start the API and Vite, so do not run those commands again.

```powershell
pnpm install
pnpm exec turbo build --filter=@confora/api^...
powershell -ExecutionPolicy Bypass -File scripts/local/setup.ps1
powershell -ExecutionPolicy Bypass -File scripts/local/start.ps1
```

The published Postgres port follows `POSTGRES_PORT` (5432 in the generated file). Change it in `.secrets/local.env` before `start.ps1` if 5432 is already taken. Stop with `scripts/local/stop.ps1`.

Open `http://localhost:3001/login`. The button goes to Keycloak. After sign-in the profile is `http://localhost:3001/dashboard/profil`. Sign in with a username from `infra/keycloak/synthetic-users.json`, `DEMO_USER_PASSWORD`, and the current TOTP from the seed described above. Do not include tokens, passwords, or the Keycloak logout URL in screenshots.
