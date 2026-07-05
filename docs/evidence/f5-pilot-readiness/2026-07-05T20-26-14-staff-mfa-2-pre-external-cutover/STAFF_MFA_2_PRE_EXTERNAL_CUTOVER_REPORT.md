# STAFF-MFA-2 Pre-External MFA Cutover Report

| Field | Value |
|-------|-------|
| **Evidence** | `docs/evidence/f5-pilot-readiness/2026-07-05T20-26-14-staff-mfa-2-pre-external-cutover/` |
| **STAFF-MFA-1** | STAFF_MFA_1_PARTIAL_POLICY_READY_ENFORCEMENT_DEFERRED |
| **STAFF-MFA-1 evidence** | `docs/evidence/f5-pilot-readiness/2026-07-05T13-40-00-staff-mfa-1/` |
| **Verdict** | **STAFF_MFA_2_PARTIAL_READY_PENDING_MANUAL_ENROLLMENT** |

## STAFF-MFA-1 confirmation

| Item | Status |
|------|--------|
| MFA capability exists (Keycloak TOTP + conditional OTP) | Confirmed — see STAFF-MFA-1 Keycloak capability check |
| Smoke bypass documented LOCAL_ONLY | Confirmed — `pilot_smoke_mfa_verified` attribute |
| Real OTP enforcement not yet proven (STAFF-MFA-1) | Confirmed — deferred |
| CA-M01 external blocker (STAFF-MFA-1) | PARTIAL_PREPARED_NOT_ENFORCED |

## Summary

- Privileged MFA scope defined (`STAFF_MFA_2_PRIVILEGED_ROLE_SCOPE.md`)
- Smoke vs external policy split documented (`STAFF_MFA_2_SMOKE_AND_EXTERNAL_POLICY_SPLIT.md`)
- Keycloak MFA: **PARTIAL_ENFORCEMENT_TESTED** — TOTP policy + conditional browser OTP; dedicated test user OTP imported
- MfaGuard denies external user without bypass at `/v1/staff/reports/overview`: **YES (403)**
- Real TOTP direct-grant + `amr` otp proof: **PARTIAL** (Keycloak 26 direct-grant limitation)
- Smoke users preserved: **YES** — `pilot.staff@confora.test` staff route 200
- Learner / public verification: **unchanged**
- Regression guard: **PASS** (F5-5 re-run after orchestrator timeout)
- CA-M01: **PARTIAL_READY_PENDING_MANUAL_ENROLLMENT**
- External pilot: **NO-GO** (MFA enrollment + Security delegate + DPO/legal pending)

## Artifacts

| Document | Purpose |
|----------|---------|
| STAFF_MFA_2_PRIVILEGED_ROLE_SCOPE.md | Privileged roles requiring MFA |
| STAFF_MFA_2_SMOKE_AND_EXTERNAL_POLICY_SPLIT.md | LOCAL_ONLY smoke vs external policy |
| STAFF_MFA_2_KEYCLOAK_CONFIGURATION_REVIEW.md | Realm / flow / user inspection |
| STAFF_MFA_2_REAL_MFA_ENFORCEMENT_PROOF.md | Dedicated-user MFA proof |
| STAFF_MFA_2_MFAGUARD_VERIFICATION.md | Nest MfaGuard probes |
| STAFF_MFA_2_SECURITY_DELEGATE_DECISION.md | Decision options (PENDING) |
| STAFF_MFA_2_CA_M01_RISK_UPDATE.md | CA-M01 status update |
| STAFF_MFA_2_REGRESSION_RESULTS.md | F5-3, F5-5, F4 audit, F4-9, S17 |
| keycloak/realm-inspection.json | Non-secret Keycloak snapshot |
| mfa-proof/mfaguard-probes.json | API probe results (no tokens stored) |

## Next action

1. Security delegate review of `STAFF_MFA_2_SECURITY_DELEGATE_DECISION.md`
2. Manual browser TOTP enrollment for external-facing privileged accounts (`pilot.staff.mfa.external@confora.test` and production equivalents)
3. Re-run MFA proof after interactive enrollment (PKCE / account console — no secrets in evidence)
4. DPO/legal review (unchanged external blocker)
