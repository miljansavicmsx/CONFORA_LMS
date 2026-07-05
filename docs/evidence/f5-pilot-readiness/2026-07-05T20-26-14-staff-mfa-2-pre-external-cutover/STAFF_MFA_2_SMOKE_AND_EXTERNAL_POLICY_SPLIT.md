# STAFF-MFA-2 Smoke vs External Policy Split

## A. Local automated smoke (LOCAL_ONLY)

| Control | Status |
|---------|--------|
| Dedicated smoke users | `pilot.staff@confora.test`, etc. |
| `pilot_smoke_mfa_verified=true` | **LOCAL_ONLY** — satisfies Nest MfaGuard without real OTP |
| Proof of external MFA | **Must NOT use smoke bypass** |

## B. External-facing privileged accounts

| Requirement | Status |
|-------------|--------|
| Real MFA enrollment or formal risk acceptance | Required before external pilot |
| No smoke bypass attribute | `pilot.staff.mfa.external@confora.test` has no bypass |
| Password-only privileged access | **Denied** at Nest MfaGuard when `mfa_verified` false |

`smoke_bypass_external_use`: **false**
