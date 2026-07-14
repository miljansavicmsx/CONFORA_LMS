# EXTERNAL-PILOT-GATE-ROLLUP-1 — Evidence Index

**Task:** EXTERNAL-PILOT-GATE-ROLLUP-1  
**Date:** 2026-07-14  
**Branch:** `fix/ca-h01-frontend-f4-cutover`  
**Status:** Consolidated rollup — **not an approval package**

This index catalogs evidence reviewed for the final external pilot gate rollup. It does **not** approve external pilot, sign-offs, real personal data, production, or staging.

---

## Primary evidence sources

| # | Evidence path | Verdict / status | What it proves | Limitations | Readiness support |
|---|---------------|------------------|----------------|-------------|-------------------|
| 1 | `docs/evidence/legal-gdpr/2026-07-14T08-34-00-dpo-legal-signoff-1/` | `DPO_LEGAL_SIGNOFF_1_READY_FOR_REVIEW_NOT_SIGNED` | DPO/legal review package; personal data inventory; G-EP 0/11; 20 residual risks | **Not signed**; legal drafts cited not approved | **Review preparation only** |
| 2 | `docs/evidence/f5-pilot-readiness/2026-07-13T21-48-00-security-delegate-signoff-1/` | `SECURITY_DELEGATE_SIGNOFF_1_READY_FOR_REVIEW_NOT_SIGNED` | Security control checklist; MFA decision brief; 9 residual risks | **Not signed**; security ≠ privacy approval | **Review preparation only** |
| 3 | `docs/evidence/f5-pilot-readiness/2026-07-13T14-24-16-staff-mfa-3-enforcement-closure/` | `STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF` | Staff MFA 403 without MFA; smoke bypass separation | Manual TOTP enrollment required; `amr` proof partial | **Internal/local technical** |
| 4 | `docs/evidence/f5-pilot-readiness/2026-07-13T14-27-00-staff-mfa-3-r1-enforcement-remediation/` | `STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF` | R1 false-positive root cause fixed; MFA invariants pass | Same enrollment limits | **Internal/local technical** |
| 5 | `docs/evidence/td-085-sequential-regression/2026-07-13T14-26-35-td-085/` | `TD_085_GO_LOCAL_BASELINE_CONFIRMED` | Live sequential local baseline (6/6 commands pass) | Local environment only | **Internal/local readiness** |
| 6 | `docs/evidence/f5-pilot-readiness/2026-07-08T17-27-33-f5-5-security-gdpr-audit-hardening/` | `F5_5_PARTIAL_RESIDUAL_SECURITY_PRIVACY_AUDIT_GAPS` | Security PASS; audit PASS; GDPR PARTIAL; retention DOCUMENTED_ONLY | DPO review PENDING; 8 corrective actions | **Internal/local technical; external gaps remain** |
| 7 | `docs/evidence/f5-pilot-readiness/2026-07-08T20-22-38-s17-public-verify-browser/` | `S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED` | Public verify no-auth, read-only, PII minimization | LIA unsigned; ops_public_ux_1r3 FAIL (out of core scope) | **Internal/local technical** |
| 8 | `docs/evidence/admin-governance-final-acceptance/2026-07-08T20-45-46-admin-gov-final-acceptance-1/` | `ADMIN_GOV_FINAL_ACCEPTANCE_GO` | Admin/governance Playwright 15/15; RBAC/tenant PASS | Local pilot users; smoke MFA bypass | **Internal/local readiness** |
| 9 | `docs/evidence/learner-final-acceptance/2026-07-08T21-14-51-learner-final-acceptance-1r/` | `LEARNER_FINAL_ACCEPTANCE_1R_GO` | Learner flows 11/11; privacy checks PASS | Local synthetic scope | **Internal/local readiness** |
| 10 | `docs/evidence/local-pilot-final-rollup/2026-07-08T22-22-01-local-pilot-final-rollup-1/` | `LOCAL_PILOT_FINAL_ROLLUP_1_GO_WITH_RESIDUAL_EXTERNAL_GATES` | Program rollup; `external_pilot_status: EXTERNAL_PILOT_NO_GO` | Pre-STAFF-MFA-3 for MFA section | **Internal/local readiness** |

---

## Legal and policy sources

| # | Document path | Status | What it proves | Limitations | Readiness support |
|---|---------------|--------|----------------|-------------|-------------------|
| L1 | `docs/legal/gdpr/EXTERNAL_PILOT_PRIVACY_GATE.md` | **0/11 NOT CLEARED** | Mandatory G-EP conditions | All conditions open | **External blocker definition** |
| L2 | `docs/legal/gdpr/L5_EXTERNAL_PILOT_DECISION_RECORD.md` | **BLOCKED** | Formal authorization record | No waivers | **External blocker** |
| L3 | `docs/legal/gdpr/LEGAL_BASIS_REGISTER.md` | **PENDING** | LB-01–LB-15 draft | Not signed | **Review preparation** |
| L4 | `docs/legal/gdpr/RETENTION_DECISION_REGISTER.md` | **PROPOSED** | R-01–R-16 draft | Not signed | **Review preparation** |
| L5 | `docs/legal/gdpr/DSR_PROCEDURE.md` | **DRAFT** | DSR workflow draft | Not approved | **Review preparation** |
| L6 | `docs/legal/gdpr/DPIA_SCOPING_NOTE.md` | **SCOPING ONLY** | Recommends DPIA before external pilot | DPO decision pending | **Review preparation** |
| L7 | `docs/PUBLIC_VERIFICATION_POLICY.md` | **Technical policy** | Scheme rules, redaction, audit | Not privacy notice | **Internal/local technical** |
| L8 | `docs/AUDIT_TRAIL_AND_RETENTION.md` | **Documented** | Append-only audit; retention domains | Legal periods unsigned | **Internal/local technical** |
| L9 | `docs/TRUST_DISCLOSURE_POLICY.md` | **Governance** | Trust/transparency | Not data-subject notice | **Contextual** |

---

## Evidence hierarchy

1. **Sign-off packages (unsigned):** DPO-LEGAL-SIGNOFF-1 + SECURITY-DELEGATE-SIGNOFF-1  
2. **Technical gates:** STAFF-MFA-3 + TD-085 (latest local baseline)  
3. **Security/privacy posture:** F5-5 + S17  
4. **Functional acceptance:** Admin-gov + learner acceptance  
5. **Program context:** Local pilot rollup  
6. **Legal gate definition:** EXTERNAL_PILOT_PRIVACY_GATE + L5 decision record  

---

## Readiness classification key

| Classification | Meaning |
|----------------|---------|
| **Internal/local readiness** | Supports CLRC / local synthetic pilot with existing evidence |
| **Internal/local technical** | Technical controls verified locally; not legal clearance |
| **Review preparation only** | Package ready for human sign-off; not authorization |
| **External blocker** | Must close before external hosted pilot with real PII |

---

## Explicit non-claims

- External pilot **not** approved  
- Security delegate **not** signed  
- DPO/legal **not** signed  
- Real personal data **not** approved  
- Production / staging **not** validated  
- No signatures, names, or dates fabricated
