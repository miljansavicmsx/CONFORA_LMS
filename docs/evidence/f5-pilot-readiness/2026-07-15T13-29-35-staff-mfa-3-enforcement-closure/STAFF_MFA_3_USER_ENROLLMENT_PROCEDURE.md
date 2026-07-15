# STAFF-MFA-3 Manual MFA Enrollment Procedure

Repeatable procedure for external-pilot privileged staff (no smoke bypass).

## Prerequisites

- Keycloak realm `confora` running
- User has privileged role (e.g. COM_CERT, STAFF_DIR) **without** `pilot_smoke_mfa_verified`
- TOTP app available (Google Authenticator, etc.)

## Steps

1. **Login** — User signs in via Keycloak browser flow or app login at `http://127.0.0.1:4000/auth/login`.
2. **Enroll TOTP** — Complete CONFIGURE_TOTP required action in Keycloak Account Console (`http://localhost:18080/realms/confora/account`) or accept OTP setup in browser flow.
3. **Confirm challenge** — Log out; sign in again; OTP prompt must appear.
4. **API MFA verify** — `POST http://127.0.0.1:4000/auth/mfa/verify` with `{ username, password, totp }` returns access token.
5. **Verify claims** — `/auth/me` shows `mfa_verified: true` and/or `amr` includes `otp`/`totp` (boolean summary only in evidence).
6. **Verify staff route** — `GET /v1/staff/reports/overview` returns 200 for MFA-complete privileged user.

## Failure modes

| Symptom | Expected handling |
|---------|-------------------|
| Password-only login on external user | Nest MfaGuard **403** on staff routes |
| Missing OTP at login | Keycloak blocks or Nest denies until `/auth/mfa/verify` |
| Smoke user in external mode | **Forbidden** — remove bypass attribute before external cutover |

## Automated test path (local only)

- Without-MFA denial fixture: `pilot.staff.no-mfa@confora.test` (local-only; not external-pilot-ready)
- MFA route-proof fixture: `pilot.staff.mfa.route-proof@confora.test` (local-only test TOTP; not external-ready cohort)
- External-ready enrolled users (`pilot.manager@confora.test`, `pilot.staff@confora.test`, `pilot.director@confora.test`, `pilot.mfa.staff@confora.test`, `pilot.staff.mfa.external@confora.test`) are **OTP read-only** — never deleted/overwritten by this script.

| User | Enrollment / fixture result |
|------|-------------------|
| `pilot.staff.mfa.route-proof@confora.test` | totpGrant=false nestMfa=false |
| `pilot.staff.no-mfa@confora.test` | no OTP; used for without-MFA denial only |
| External-ready OTP preserved | before=5/5 after=5/5 |
