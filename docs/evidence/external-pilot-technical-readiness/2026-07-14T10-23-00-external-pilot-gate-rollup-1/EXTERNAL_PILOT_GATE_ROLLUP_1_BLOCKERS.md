# EXTERNAL-PILOT-GATE-ROLLUP-1 — Blockers Register

**Task:** EXTERNAL-PILOT-GATE-ROLLUP-1  
**Date:** 2026-07-14  
**Status:** All blockers **OPEN** unless noted

---

## Blocker register

| Blocker ID | Title | Severity | Owner | Evidence source | Required action | Condition to close | External pilot impact |
|------------|-------|----------|-------|-----------------|-----------------|-------------------|----------------------|
| **B-EP-01** | Security delegate not signed | **High** | Security delegate | `security-delegate-signoff-1/` | Review package; complete sign-off template | Signed decision recorded in evidence folder | **BLOCKER** — G-EP-07 cannot close |
| **B-EP-02** | DPO/legal not signed | **High** | DPO + Legal | `dpo-legal-signoff-1/` | Review package; complete sign-off template | Signed DPO/legal decision with date | **BLOCKER** — privacy gate blocked |
| **B-EP-03** | DPIA decision pending | **High** | DPO | `DPIA_SCOPING_NOTE.md`; DPO package | Execute DPIA or document no-DPIA decision | Signed DPIA or written no-DPIA decision (G-EP-05) | **BLOCKER** |
| **B-EP-04** | Real personal data not approved | **High** | DPO + Legal + Director | L5 decision record; DPO package | Explicit written authorization for real PII | Signed authorization in L5 / DPO record | **BLOCKER** |
| **B-EP-05** | Retention schedule unsigned | **High** | Legal + DPO + Director | `RETENTION_DECISION_REGISTER.md` | Sign R-01–R-16 | RETENTION_APPROVAL_REGISTER signed (G-EP-03) | **BLOCKER** |
| **B-EP-06** | DSR procedure unsigned / partial | **High** | DPO + Legal | `DSR_PROCEDURE.md`; DPO DSR checklist | Approve procedure; prove E2E export | Signed DSR procedure (G-EP-04) | **BLOCKER** |
| **B-EP-07** | Processor/DPA status pending | **High** | Legal | DPO processors doc; GDPR sign-off log | Complete subprocessor register; sign DPAs | G-EP-10 COMPLETE | **BLOCKER** for hosted stack |
| **B-EP-08** | Manual TOTP enrollment pending | **Medium** | Security + IT/IdP | STAFF-MFA-3; security delegate package | Enroll all external-facing staff in TOTP | Enrollment log; no smoke bypass on external users | **BLOCKER** for external staff access |
| **B-EP-09** | Staging/production validation not claimed | **Medium** | Platform + Ops | No signed EP-TECH/staging evidence | Validate hosted staging per STG-001 | Signed staging validation evidence | **BLOCKER** for external hosted deploy |
| **B-EP-10** | F5-5 residual security/privacy/audit gaps | **Medium** | DPO + Engineering | F5-5 2026-07-08; open risks register | Close or accept documented residuals | F5-5 corrective actions addressed or waived | **Conditional** — identity evidence, DSR export |
| **B-EP-11** | External participant terms / privacy notice pending | **High** | Legal + DPO + Director | `CONFORA_GDPR_POLICY.md` DRAFT; G-EP-01 | Publish privacy notice; pilot participant terms | G-EP-01 COMPLETE; terms signed | **BLOCKER** |
| **B-EP-12** | Legal basis register unsigned | **High** | Legal counsel | `LEGAL_BASIS_REGISTER.md` | Sign LB-01–LB-15; resolve Art. 9 (LB-15) | G-EP-02 COMPLETE | **BLOCKER** |
| **B-EP-13** | Public verification LIA unsigned | **Medium** | Legal + DPO | `LIA_PUBLIC_VERIFICATION_ASSESSMENT.md` | Complete and sign LIA | G-EP-11 COMPLETE (if external URL) | **BLOCKER** if public URL external |
| **B-EP-14** | hCaptcha not configured for external | **Medium** | Security | G-EP-08; EXTERNAL_PILOT_PRIVACY_GATE | Set HCAPTCHA_SECRET; VERIFY_CAPTCHA_SKIP=false | G-EP-08 COMPLETE | **BLOCKER** for external public surfaces |

---

## Blocker summary

| Severity | Count |
|----------|------:|
| **High** | **9** |
| **Medium** | **5** |
| **Low** | 0 |
| **Total open** | **14** |

---

## Minimum blockers (task-required set)

| ID | Present | Severity |
|----|:-------:|----------|
| B-EP-01 | ✓ | High |
| B-EP-02 | ✓ | High |
| B-EP-03 | ✓ | High |
| B-EP-04 | ✓ | High |
| B-EP-05 | ✓ | High |
| B-EP-06 | ✓ | High |
| B-EP-07 | ✓ | High |
| B-EP-08 | ✓ | Medium |
| B-EP-09 | ✓ | Medium |
| B-EP-10 | ✓ | Medium |
| B-EP-11 | ✓ | High |

All 11 required blockers are **OPEN**.

---

## Closure sequence (recommended)

1. B-EP-08 (TOTP enrollment) — operational prerequisite  
2. B-EP-01 (security delegate) — parallel with DPO prep  
3. B-EP-02, B-EP-03, B-EP-05, B-EP-06, B-EP-07, B-EP-11, B-EP-12 (privacy/legal bundle)  
4. B-EP-13, B-EP-14 (public surface controls)  
5. B-EP-09 (staging) — if hosted external pilot  
6. B-EP-10 (F5-5 residuals) — ongoing; document acceptances  
7. B-EP-04 + formal L5 update — **last**; only after G-EP conditions met  

---

## Explicit non-claims

No blocker is closed by this rollup. No waiver granted.
