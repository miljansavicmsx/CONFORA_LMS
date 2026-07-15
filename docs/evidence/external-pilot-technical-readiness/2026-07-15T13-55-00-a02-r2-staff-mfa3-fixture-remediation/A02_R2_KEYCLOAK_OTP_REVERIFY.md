# A-02-R2 Keycloak OTP Reverify

**Status:** PASS for external-ready cohort (5/5 OTP; smoke absent)

## Before STAFF-MFA-3 (post A-02-R2 restore / operator window)

All five external-ready users existed with OTP type present and no smoke bypass.

Linked STAFF-MFA-3 snapshots:

- `docs/evidence/f5-pilot-readiness/2026-07-15T13-29-35-staff-mfa-3-enforcement-closure/mfa-proof/external-ready-otp-before.json` → **otpCount 5**
- `.../external-ready-otp-after.json` → **otpCount 5**

## After STAFF-MFA-3 (final A-02-R2 reverify)

| User | Exists | OTP | Smoke bypass |
|------|--------|-----|--------------|
| `pilot.manager@confora.test` | yes | yes | no |
| `pilot.staff@confora.test` | yes | yes | no |
| `pilot.director@confora.test` | yes | yes | no |
| `pilot.mfa.staff@confora.test` | yes | yes | no |
| `pilot.staff.mfa.external@confora.test` | yes | yes | no |

## No-MFA fixture (not counted as external-ready)

| User | Exists | OTP | Smoke |
|------|--------|-----|-------|
| `pilot.staff.no-mfa@confora.test` | yes | **no** | no |

Raw safe metadata: `keycloak-a02-r2-otp-reverify.json`

## Note on EXTERNAL OTP restore

A-02-R1 had left EXTERNAL without OTP. At A-02-R2 start, operator re-enrollment was not yet visible; a local credential-type restore was applied to unblock the non-destructive fixture proof. **Secret values were not written to evidence.** Operator should confirm authenticator alignment for EXTERNAL if a different A-01-R4 secret was previously used.
