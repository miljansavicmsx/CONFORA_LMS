# A-02-R3 — Security Conditions Matrix

| # | Condition | Status | Evidence | Blocks external pilot? |
|---|-----------|--------|----------|:----------------------:|
| 1 | A-01-R4: 5/5 real OTP credentials | **GO** | A-01-R4 summary: `external_facing_staff_totp_enrolled: 5` | No (enables review) |
| 2 | A-01-R4: no secrets committed | **PASS** | `totp_secret_committed/qr/tokens/passwords: false` | No |
| 3 | Smoke attribute cleanup | **DONE** | A-02-R1: `smoke_attribute_users_after: []` | No |
| 4 | STAFF-MFA-3 fixture separation | **PASS** | A-02-R2 / STAFF-MFA-3: dedicated `pilot.staff.no-mfa@confora.test` | No |
| 5 | STAFF-MFA-3 OTP preservation 5/5 | **PASS** | STAFF-MFA-3: `external_ready_otp_before/after: 5` | No |
| 6 | STAFF-MFA-3 technical verdict | **GO_PENDING_SECURITY_DELEGATE_SIGNOFF** | `2026-07-15T13-29-35-staff-mfa-3-enforcement-closure` | No (needs signoff) |
| 7 | Privileged without MFA denied | **DENIED_403** | STAFF-MFA-3 summary | No |
| 8 | TD-085 / S17 local baseline | **GO / PASS_WITH_TRANSIENT_INFRA_NOTE** | S17-R1 + live TD-085 `14-31-08` | No |
| 9 | Public verify no-auth | **PRESERVED** | S17: `public_route_no_auth_status: PASS` | No |
| 10 | Public verify read-only | **PRESERVED** | S17: `read_only_status: PASS` | No |
| 11 | PII minimization | **PRESERVED** | S17: `pii_minimization_status: PASS` | No |
| 12 | Secret hygiene (password fallbacks) | **GO_SECRET_HYGIENE_RESTORED** | TD-085-S17-R1A | No |
| 13 | Keycloak direct-grant TOTP/amr limitation | **DOCUMENTED** | A-01-R4 / STAFF-MFA-3 / A-02 | Accept-as-condition |
| 14 | Security delegate actual decision | **PENDING** | No signed artifact | **YES** |
| 15 | DPO/legal signoff | **UNSIGNED** | Prior DPO package not signed | **YES** |
| 16 | External pilot approval | **NOT APPROVED** | All packages | **YES** |
| 17 | Real personal data approval | **NOT APPROVED** | All packages | **YES** |
| 18 | Staging / production validation | **NOT CLAIMED** | All packages | **YES** (out of scope) |

## Gate interpretation

| Gate | Ready for next action? |
|------|------------------------|
| Technical MFA enrollment (A-01-R4) | Yes — ready for delegate review |
| Technical STAFF-MFA-3 | Yes — GO pending delegate signoff |
| Technical TD-085/S17 privacy baseline | Yes — local baseline restored |
| Technical secret hygiene | Yes — password fallbacks removed |
| **Actual security delegate signature** | **No — still required** |
| DPO/legal + external pilot | **No — still blocked** |
