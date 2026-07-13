# STAFF-MFA-3 Enforcement Model

## Combined model (A + C)

1. **Backend guard (always on):** `MfaGuard` checks `MFA_MANDATORY_ROLES` against `deriveMfaVerified`.
2. **Ops readiness gate:** `npm run ops:staff-mfa-3-enforcement-closure` validates Keycloak users, token claims, and staff route probes.
3. **Local smoke bypass (explicit):** Keycloak `pilot_smoke_mfa_verified` attribute — **not** an API auth bypass.

## Canonical MFA signal

```typescript
deriveMfaVerified(payload):
  if payload.mfa_verified === true → true
  if payload.amr includes otp|totp|mfa → true
  else → false
```

## Environment flags (documented mapping)

| Suggested flag | Canonical equivalent |
|----------------|---------------------|
| `STAFF_MFA_ENFORCEMENT_ENABLED=true` | `MfaGuard` active (default in API) |
| `STAFF_MFA_REQUIRED_FOR_EXTERNAL_PILOT=true` | External users without OTP/bypass → 403 |
| `STAFF_MFA_LOCAL_SMOKE_BYPASS_ALLOWED=true` | `pilot_smoke_mfa_verified` on designated smoke users only |

No duplicate backend env flags added — existing Keycloak attribute + guard is the canonical pattern from STAFF-MFA-1/2.

## Protected staff roles (`MFA_MANDATORY_ROLES`)

Includes: STAFF_DIR, STAFF_SYSADM, STAFF_TRAINADM, COM_CERT, SME, committee roles, QUALITY_MANAGER, EXAMINER, INVIGILATOR, etc.

Learners (`USR_CAND`, `USR_CERT`) are **not** in staff MFA mandatory set unless exam-start MFA decorator applies separately.

## External pilot readiness rule

Staff user is **external-pilot-ready** when:

- Has privileged staff role
- **No** `pilot_smoke_mfa_verified` smoke bypass
- OTP credential enrolled **and** token shows `amr` otp **or** successful `/auth/mfa/verify`
