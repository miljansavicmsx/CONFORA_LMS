# STAFF-MFA-2 Keycloak Configuration Review

| Item | Status |
|------|--------|
| Realm `confora` | EXISTS |
| OTP policy | TOTP 6/30s |
| Browser conditional OTP | Present (conditional-user-configured) |
| Classification | **PARTIAL_ENFORCEMENT_TESTED** |

## User sample

- `pilot.staff@confora.test`: exists=true otp=false smokeBypass=true
- `pilot.director@confora.test`: exists=true otp=false smokeBypass=true
- `pilot.mfa.staff@confora.test`: exists=true otp=true smokeBypass=none
- `pilot.staff.mfa.external@confora.test`: exists=true otp=false smokeBypass=none
- `pilot.learner@confora.test`: exists=true otp=false smokeBypass=none

No secrets exported.
