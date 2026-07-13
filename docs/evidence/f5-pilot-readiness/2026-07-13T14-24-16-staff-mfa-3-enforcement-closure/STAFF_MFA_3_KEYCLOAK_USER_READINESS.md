# STAFF-MFA-3 Keycloak User Readiness

| User | Exists | Role(s) | Tenant | OTP credential | Required actions | Token claim ready | External pilot ready |
|------|--------|---------|--------|----------------|------------------|-----------------|---------------------|
| `pilot.staff@confora.test` | yes | COM_CERT, default-roles-confora | 00000000-0000-4000-8000-000000000001 | no | none | partial/yes | no (smoke bypass only) |
| `pilot.manager@confora.test` | yes | STAFF_TRAINADM, default-roles-confora | 00000000-0000-4000-8000-000000000001 | no | none | partial/yes | no (smoke bypass only) |
| `pilot.director@confora.test` | yes | STAFF_DIR, default-roles-confora | 00000000-0000-4000-8000-000000000001 | no | none | partial/yes | no (smoke bypass only) |
| `pilot.mfa.staff@confora.test` | yes | COM_CERT | 00000000-0000-4000-8000-000000000001 | yes | none | partial/yes | yes (OTP) |
| `pilot.staff.mfa.external@confora.test` | yes | COM_CERT | 00000000-0000-4000-8000-000000000001 | no | none | no | no |
| `pilot.learner@confora.test` | yes | USR_CAND, default-roles-confora | 00000000-0000-4000-8000-000000000001 | no | none | no | no |
| `pilot.staff.wrong-tenant@confora.test` | yes | COM_CERT, default-roles-confora | 00000000-0000-4000-8000-000000000001 | no | none | partial/yes | no (smoke bypass only) |

## Manual enrollment checklist (external-facing staff)

1. Remove `pilot_smoke_mfa_verified` attribute if present.
2. Enroll TOTP via Keycloak account console or browser CONFIGURE_TOTP flow.
3. Verify login prompts for OTP.
4. Confirm `POST /auth/mfa/verify` returns token with `mfa_verified` or `amr` otp.
5. Confirm `GET /v1/staff/reports/overview` returns 200.

Dedicated test users: `pilot.mfa.staff@confora.test` (enrolled), `pilot.staff.mfa.external@confora.test` (denial proof, no OTP).
