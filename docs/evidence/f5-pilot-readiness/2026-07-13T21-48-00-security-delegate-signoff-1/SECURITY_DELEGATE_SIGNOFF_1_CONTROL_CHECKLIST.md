# SECURITY-DELEGATE-SIGNOFF-1 — Control Checklist

**Reviewer:** Security delegate (unsigned)  
**Legend:** PASS = evidenced OK · PARTIAL = gap or manual step remains · BLOCKED = cannot verify · N/A = not in scope

| # | Control area | Status | Rationale | Evidence reference |
|---|--------------|--------|-----------|-------------------|
| 1 | **Authentication (Keycloak + Nest JWT)** | PASS | Pilot users authenticate via Keycloak; JWT validated in API | TD-085 preflight; F5-3; STAFF-MFA-3 route probes |
| 2 | **Staff MFA enforcement (MfaGuard)** | PARTIAL | External staff without MFA denied **403** on privileged routes; backend guard active | STAFF-MFA-3 `privileged_route_without_mfa_status: DENIED_403`; `mfa_challenge_status: DENIED_WITHOUT_MFA` |
| 3 | **Local smoke bypass separation** | PASS | `pilot_smoke_mfa_verified` on designated smoke users only; absent on external candidate user | STAFF-MFA-3 `smoke_bypass_separation_status: DOCUMENTED_AND_VERIFIED` |
| 4 | **RBAC (staff vs learner)** | PASS | Learner denied staff routes; admin-gov and learner acceptance pass | STAFF-MFA-3 learner denial; `ADMIN_GOV_FINAL_ACCEPTANCE_GO`; `LEARNER_FINAL_ACCEPTANCE_1R_GO` |
| 5 | **Tenant isolation** | PARTIAL | F5-3 and acceptance checks pass; wrong-tenant probe documented in STAFF-MFA-3 (HTTP 200 on overview — review tenant data scope) | F5-3; STAFF-MFA-3 route-probes `wrongTenant`; F5-5 tenant not weakened |
| 6 | **Public verification (no-auth / read-only)** | PASS | Public verify API 200 without auth; no PII fields in probe; S17 browser GO | STAFF-MFA-3 `publicVerify`; S17 `S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED` |
| 7 | **Privacy / PII minimization** | PARTIAL | S17 and learner privacy PASS; F5-5 GDPR readiness **PARTIAL**; identity evidence partial | F5-5 `gdpr_privacy_readiness_status: PARTIAL`; S17 PII checks |
| 8 | **Audit logging / immutability** | PASS | F5-5 audit hardening PASS; immutability implemented; actor FK PASS | F5-5 `audit_hardening_status: PASS`; `audit_immutability_status: IMPLEMENTED` |
| 9 | **GDPR / security residual risks (F5-5)** | PARTIAL | 1 HIGH + 4 MEDIUM + 3 LOW open at F5-5 time; some mitigated since (MFA, S17, CA-H01) but register not formally closed | F5-5 `F5_5_OPEN_RISKS_AND_CORRECTIVE_ACTIONS.md`; risks.json |
| 10 | **Operational runbooks / startup** | PARTIAL | Local startup runbook documented and validated in rollup; staging runbooks not in scope | Local pilot rollup `startup_runbook_status: DOCUMENTED_AND_VALIDATED` |
| 11 | **Manual TOTP enrollment (external staff)** | PARTIAL | Required; 0 external-pilot MFA-ready users with real OTP; checklist documented | STAFF-MFA-3 `manual_enrollment_required: true`; USER_ENROLLMENT_PROCEDURE |
| 12 | **Automated OTP / amr evidence** | PARTIAL | Keycloak 26 direct-grant TOTP + `amr: otp` not fully automated; OTP credential + password-only block proven | STAFF-MFA-3 enrollment-mfa-user.json; R1 residual risks |
| 13 | **Incident / rollback readiness** | PARTIAL | Documented in F5-6 runbooks reference; not live-drilled in this package | F5-5 R-L02; local rollup residual gates |
| 14 | **External pilot gating conditions** | BLOCKED | External pilot explicitly NO-GO in rollup; DPO/legal pending; MFA delegate sign-off pending | Rollup `external_pilot_status: EXTERNAL_PILOT_NO_GO`; this package |

---

## Summary counts

| Status | Count |
|--------|-------|
| PASS | 5 |
| PARTIAL | 8 |
| BLOCKED | 1 |
| NOT_APPLICABLE | 0 |

---

## Security delegate focus areas

1. Accept **PARTIAL** on items 2, 11, 12 for **internal/local pilot** only?  
2. Require manual TOTP completion before **any external-facing staff** access?  
3. Confirm F5-5 residual risks (especially R-H01 legacy paths, R-M03 DPO) acceptable with TD-085 + STAFF-MFA-3 updates?  
4. External pilot remains **BLOCKED** until DPO/legal + enrollment + delegate conditions met.
