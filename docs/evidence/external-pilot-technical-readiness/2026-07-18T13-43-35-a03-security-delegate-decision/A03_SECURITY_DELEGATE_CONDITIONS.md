# A-03 — Security Delegate Conditions

Technical conditions carried forward from A-02-R3 for delegate review. Status values reflect **evidence summaries**, not a signed acceptance.

| # | Condition | Evidence status | Blocks external pilot? |
|---|-----------|-----------------|:----------------------:|
| 1 | A-01-R4: 5/5 external-facing staff TOTP enrolled | GO (pending delegate review) | No (enables review) |
| 2 | A-01-R4: no TOTP secrets / QR / tokens committed | PASS | No |
| 3 | Smoke attribute cleanup complete | DONE (`smoke_attribute_users_after: []`) | No |
| 4 | STAFF-MFA-3 fixture separation (no-MFA user separate) | PASS | No |
| 5 | STAFF-MFA-3 OTP preservation 5/5 | PASS | No |
| 6 | STAFF-MFA-3 technical verdict | `STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF` | Needs signoff |
| 7 | Privileged without MFA denied | DENIED (as evidenced) | No |
| 8 | TD-085 / S17 local privacy baseline restored | GO / PASS with transient infra note | No |
| 9 | Public verification no-auth | PRESERVED | No |
| 10 | Public verification read-only | PRESERVED | No |
| 11 | Public verification PII minimization | PRESERVED | No |
| 12 | Secret hygiene (password fallbacks removed) | `TD_085_S17_R1A_GO_SECRET_HYGIENE_RESTORED` | No |
| 13 | Keycloak direct-grant TOTP/amr limitation | DOCUMENTED (accept-as-condition candidate) | Accept-as-condition |
| 14 | **Actual security delegate signed decision** | **PENDING** | **YES** |
| 15 | DPO/legal signoff | UNSIGNED | **YES** |
| 16 | External pilot approval | NOT APPROVED | **YES** |
| 17 | Real personal data approval | NOT APPROVED | **YES** |
| 18 | Staging / production validation | NOT CLAIMED | **YES** (out of scope) |

## Condition notes for any future ACCEPT

If a delegate later selects `ACCEPT_WITH_CONDITIONS_FOR_EXTERNAL_PILOT_GATE_REVIEW`, typical condition candidates include:

- C-01: Documented Keycloak direct-grant TOTP/amr limitation accepted for current local/pilot posture.
- C-02: Staging validation required before any external cutover (not claimed here).
- C-03: DPO/legal and external pilot gate remain separate mandatory gates.

Condition rows in the signed template remain blank until a real delegate fills them.
