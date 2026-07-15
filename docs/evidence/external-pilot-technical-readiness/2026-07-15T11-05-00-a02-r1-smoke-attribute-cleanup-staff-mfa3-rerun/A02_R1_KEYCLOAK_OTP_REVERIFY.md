# A-02-R1 Keycloak OTP Reverify

**Status:** `PARTIAL` (final state after STAFF-MFA-3 rerun)

## Checkpoint A — immediately after smoke cleanup (before STAFF-MFA-3)

| User | Exists | OTP type present | Smoke bypass | Required actions |
|------|--------|------------------|--------------|------------------|
| `pilot.manager@confora.test` | yes | yes | no | none |
| `pilot.staff@confora.test` | yes | yes | no | none |
| `pilot.director@confora.test` | yes | yes | no | none |
| `pilot.mfa.staff@confora.test` | yes | yes | no | `CONFIGURE_TOTP` |
| `pilot.staff.mfa.external@confora.test` | yes | yes | no | none |

**Result:** 5/5 OTP; 0/5 smoke bypass.

Note: `CONFIGURE_TOTP` on `pilot.mfa.staff@confora.test` was already present from prior state and was not cleared during smoke cleanup (OTP credential already present).

## Checkpoint B — after STAFF-MFA-3 live rerun

| User | Exists | OTP type present | Smoke bypass | Required actions |
|------|--------|------------------|--------------|------------------|
| `pilot.manager@confora.test` | yes | yes | no | none |
| `pilot.staff@confora.test` | yes | yes | no | none |
| `pilot.director@confora.test` | yes | yes | no | none |
| `pilot.mfa.staff@confora.test` | yes | yes | no | none |
| `pilot.staff.mfa.external@confora.test` | yes | **no** | no | none |

**Result:** 4/5 OTP; 0/5 smoke bypass.

## Cause of OTP drop on EXTERNAL

`scripts/ops/run-staff-mfa-3-enforcement-closure.mjs` intentionally calls `deleteOtpCredentials` on `pilot.staff.mfa.external@confora.test` to preserve a without-MFA denial control. That mutates the A-01-R4 enrolled cohort.

**Not claimed:** re-enrollment of EXTERNAL after the script (would require a new authenticator secret and must not be committed).

## Safe capture only

Credential values, TOTP secrets, QR/otpauth URLs, passwords, and tokens were not captured.
