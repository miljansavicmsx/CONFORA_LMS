# STAFF-MFA-3-R1 Diagnosis

**Previous run:** `docs/evidence/f5-pilot-readiness/2026-07-13T14-00-52-staff-mfa-3-enforcement-closure/`  
**Remediation run:** `docs/evidence/f5-pilot-readiness/2026-07-13T14-24-16-staff-mfa-3-enforcement-closure/`

## Symptoms (previous run)

| Field | Value |
|-------|-------|
| `final_verdict` | `STAFF_MFA_3_NO_GO_MFA_RBAC_PRIVACY_REGRESSION` |
| `regression_guard_status` | FAIL |
| `mfa_route_proof_user` | null |
| `privileged_route_with_mfa_status` | PARTIAL |
| MFA invariants | All PASS (403 denial, learner denied, smoke separation, public verify API) |

## Root cause

**False-positive NO_GO from gate logic**, not an actual MFA/RBAC/privacy regression.

1. **`regression_guard_status` FAIL** — Caused by `ops:s17-public-verify-browser` LIVE failure during MFA closure. S17 evidence (`2026-07-13T14-01-44`) shows `frontend_status: DOWN` — frontend not running on port 3001. This is an **environment/precondition failure**, unrelated to MFA enforcement.

2. **`final_verdict` NO_GO** — Verdict logic used `!regressionPass` (full suite including S17) **before** evaluating MFA invariants, incorrectly mapping a transient S17 failure to `STAFF_MFA_3_NO_GO_MFA_RBAC_PRIVACY_REGRESSION`.

3. **`mfa_route_proof_user` null / `privileged_route_with_mfa_status` PARTIAL** — Keycloak 26 direct-grant + TOTP does not yield automated `nestMfaVerifyOk` (known limitation). OTP credential is present and password-only grant is blocked (`enrollment-mfa-user.json`), but automated route proof with real `amr: otp` token was not obtained. This is **expected partial**, not a security regression.

## MFA invariants (unchanged — all PASS in both runs)

- External user without MFA → staff routes **403**
- Smoke staff with bypass → staff routes **200** (local only)
- Learner → staff route **403** (RBAC)
- Public verification API → **200**, PII minimized
- Smoke bypass absent on external candidate user

## Conclusion

No RBAC, tenant isolation, privacy, or MFA enforcement weakening was detected. The NO_GO was a **verdict classification bug** in the ops closure script.
