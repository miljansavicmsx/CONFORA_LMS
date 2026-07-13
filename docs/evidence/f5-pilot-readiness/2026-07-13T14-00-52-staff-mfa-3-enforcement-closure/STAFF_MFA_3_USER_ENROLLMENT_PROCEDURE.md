# STAFF-MFA-3 Manual MFA Enrollment Procedure

Repeatable procedure for external-pilot privileged staff (no smoke bypass).

## Prerequisites

- Keycloak realm `confora` running
- User has privileged role (e.g. COM_CERT, STAFF_DIR) **without** `pilot_smoke_mfa_verified`
- TOTP app available (Google Authenticator, etc.)

## Steps

1. **Login** — User signs in via Keycloak browser flow or app login at `http://localhost:4000/auth/login`.
2. **Enroll TOTP** — Complete CONFIGURE_TOTP required action in Keycloak Account Console (`http://localhost:18080/realms/confora/account`) or accept OTP setup in browser flow.
3. **Confirm challenge** — Log out; sign in again; OTP prompt must appear.
4. **API MFA verify** — `POST http://localhost:4000/auth/mfa/verify` with `{ username, password, totp }` returns access token.
5. **Verify claims** — `/auth/me` shows `mfa_verified: true` and/or `amr` includes `otp`/`totp` (boolean summary only in evidence).
6. **Verify staff route** — `GET /v1/staff/reports/overview` returns 200 for MFA-complete privileged user.

## Failure modes

| Symptom | Expected handling |
|---------|-------------------|
| Password-only login on external user | Nest MfaGuard **403** on staff routes |
| Missing OTP at login | Keycloak blocks or Nest denies until `/auth/mfa/verify` |
| Smoke user in external mode | **Forbidden** — remove bypass attribute before external cutover |

## Automated test path (local only)

Dedicated users `pilot.mfa.staff@confora.test` and `pilot.staff.mfa.external@confora.test` — TOTP credential imported via admin partialImport for closure probes only. **Not** for production.

| User | Enrollment result |
|------|-------------------|
| `pilot.mfa.staff@confora.test` | totpGrant=false nestMfa=false |
| `pilot.staff.mfa.external@confora.test` | totpGrant=false nestMfa=false |
