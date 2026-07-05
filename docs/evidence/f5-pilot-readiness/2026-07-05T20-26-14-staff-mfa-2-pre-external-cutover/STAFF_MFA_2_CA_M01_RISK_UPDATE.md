# STAFF-MFA-2 CA-M01 Risk Update

| Field | Value |
|-------|-------|
| **CA-M01** | **PARTIAL_READY_PENDING_MANUAL_ENROLLMENT** |
| Previous (STAFF-MFA-1) | PARTIAL_PREPARED_NOT_ENFORCED |
| Previous (failed probe run) | BLOCKED — incorrect UUID / user_roles insert (remediated) |

## Evidence supporting PARTIAL

| Control | Status |
|---------|--------|
| Privileged MFA scope defined | DEFINED |
| Smoke vs external policy split | DOCUMENTED |
| Keycloak TOTP + conditional OTP | CONFIGURED |
| Dedicated external user without smoke bypass | `pilot.staff.mfa.external@confora.test` — MfaGuard 403 on staff route |
| Real TOTP login + `amr` otp | PARTIAL — direct grant blocked on Keycloak 26 |
| Automated smokes | PASS — smoke bypass LOCAL_ONLY unchanged |

## External pilot impact

External pilot remains **NO-GO** until:

- Real MFA enrollment completed for external-facing privileged users **or**
- Formal Security delegate risk acceptance documented

DPO/legal review: **PENDING** (unchanged).

## Not CLOSED because

CLOSED requires privileged external-facing users to require real MFA with captured proof. TOTP grant + `amr` otp not fully confirmed via automated path; manual enrollment sign-off remains.
