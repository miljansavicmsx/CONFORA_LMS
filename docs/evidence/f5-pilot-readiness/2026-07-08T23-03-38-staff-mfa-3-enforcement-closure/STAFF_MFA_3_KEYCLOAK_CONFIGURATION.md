# STAFF-MFA-3 Keycloak Configuration

| Item | Value |
|------|-------|
| Realm | `confora` |
| Browser flow | browser |
| OTP policy | TOTP 6 digits / 30s |
| Conditional OTP | Present in browser flow executions |
| `mfa_verified` mapper | Present (pilot_smoke_mfa_verified) |

## Roles with LOCAL_ONLY smoke bypass attribute

- `COM_CERT`
- `STAFF_DIR`
- `STAFF_SYSADM`
- `STAFF_TRAINADM`
- `SME`

## User matrix (non-secret)

| User | Smoke bypass | OTP enrolled | External candidate |
|------|--------------|--------------|-------------------|
| `pilot.staff@confora.test` | true | no | no |
| `pilot.director@confora.test` | true | no | no |
| `pilot.mfa.staff@confora.test` | none | yes | yes |
| `pilot.staff.mfa.external@confora.test` | none | no | yes |
| `pilot.learner@confora.test` | none | no | yes |
| `pilot.staff.wrong-tenant@confora.test` | true | no | no |

No passwords, OTP seeds, QR values, or JWTs stored.
