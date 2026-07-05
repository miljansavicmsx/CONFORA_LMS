# STAFF-MFA-2 Real MFA Enforcement Proof

| Proof | Status |
|-------|--------|
| Dedicated user (`pilot.mfa.staff@confora.test`) | Used — smoke users unchanged |
| CONFIGURE_TOTP / OTP credential | Credential imported |
| Password-only after OTP enrolled | BLOCKED |
| Password+TOTP grant | PARTIAL/FAIL |
| `amr` includes otp/totp | NOT CONFIRMED |
| External user without bypass denied at API | PASS (403) |
| Smoke staff still login | PASS |
| Learner unaffected | PASS |
| Public verify unaffected | PASS |

## Blocker (if partial)

Keycloak 26 direct-grant password+totp may not return `amr` otp even when credential exists. Browser conditional OTP flow remains manual enrollment path for full proof.

No OTP seeds, QR codes, recovery codes, passwords, tokens, or JWTs stored in this evidence.
