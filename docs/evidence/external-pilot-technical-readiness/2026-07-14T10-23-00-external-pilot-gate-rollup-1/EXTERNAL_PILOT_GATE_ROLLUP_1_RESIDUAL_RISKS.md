# EXTERNAL-PILOT-GATE-ROLLUP-1 — Consolidated Residual Risks

**Task:** EXTERNAL-PILOT-GATE-ROLLUP-1  
**Date:** 2026-07-14  
**Sources:** SECURITY-DELEGATE-SIGNOFF-1 (SD-R01–R12); DPO-LEGAL-SIGNOFF-1 (R-DPO-01–R20); F5-5 open risks

**Policy:** Do not downgrade High risks without signed mitigation evidence. Duplicates merged; source IDs preserved.

---

## Consolidated risk register

| Risk ID | Source ID(s) | Title | Severity | Domain | Owner | Mitigation | Status | Required decision | Pilot impact |
|---------|--------------|-------|----------|--------|-------|------------|--------|-------------------|--------------|
| R-EP-01 | SD-R02, R-DPO-07 | Security delegate sign-off pending | **High** | Security | Security delegate | Complete SECURITY-DELEGATE-SIGNOFF-1 template | **OPEN** | Accept/reject/conditional MFA | **BLOCKER** |
| R-EP-02 | SD-R03, R-DPO-01 | DPO/legal sign-off pending | **High** | Legal | DPO + Legal | Complete DPO-LEGAL-SIGNOFF-1 template | **OPEN** | Privacy/legal decision | **BLOCKER** |
| R-EP-03 | SD-R09, R-DPO-09 | External pilot not approved | **High** | Governance | Program governance | Maintain NO-GO until all gates pass | **OPEN** | Formal L5 approval | **BLOCKER** |
| R-EP-04 | R-DPO-11 | Real personal data not approved | **High** | Legal | DPO + Legal | Explicit authorization for external real PII | **OPEN** | Written authorization | **BLOCKER** |
| R-EP-05 | R-DPO-02 | DPIA decision pending | **High** | Privacy | DPO | Execute DPIA or signed no-DPIA decision | **OPEN** | G-EP-05 | **BLOCKER** |
| R-EP-06 | R-DPO-03 | Retention schedule unsigned | **High** | Legal | Legal + DPO | Sign R-01–R-16 | **OPEN** | G-EP-03 | **BLOCKER** |
| R-EP-07 | R-DPO-04 | DSR procedure unsigned / partial | **High** | Legal | DPO + Legal | Approve DSR procedure; E2E export proof | **OPEN** | G-EP-04 | **BLOCKER** |
| R-EP-08 | R-DPO-05 | Processor / DPA status pending | **High** | Legal | Legal | Subprocessor register + signed DPAs | **OPEN** | G-EP-10 | **BLOCKER** |
| R-EP-09 | R-DPO-06 | Legal basis register unsigned | **High** | Legal | Legal counsel | Sign LB-01–LB-15; Art. 9 resolve | **OPEN** | G-EP-02 | **BLOCKER** |
| R-EP-10 | R-DPO-15 | Privacy notice / GDPR policy not published | **High** | Privacy | DPO + Legal + Director | Publish approved policy | **OPEN** | G-EP-01 | **BLOCKER** |
| R-EP-11 | R-DPO-12 | ID document handling retention unresolved | **High** | Privacy | DPO + Legal | Sign R-01; IAL-2 validation G-EP-06 | **OPEN** | Art. 9 + retention | **BLOCKER** |
| R-EP-12 | SD-R01, R-DPO-08 | Manual TOTP enrollment pending | **High** | Security | Security + IT/IdP | Enroll external-facing staff | **OPEN** | Enrollment complete | **BLOCKER** (staff) |
| R-EP-13 | SD-R08, R-DPO-10 | Staging/production not validated | **Medium** | Infra | Platform + Ops | Staging validation evidence | **OPEN** | STG-001 policy | External hosted blocked |
| R-EP-14 | SD-R05, F5-5 | F5-5 GDPR/privacy readiness partial | **Medium** | Privacy | DPO + Engineering | Close F5-5 residual gaps | **OPEN** | Acknowledge partial posture | Conditional |
| R-EP-15 | SD-R04 | Automated OTP `amr` proof partial (Keycloak 26) | **Medium** | Security | Engineering | Manual TOTP enrollment; document limitation | **OPEN** | Accept for internal; manual for external | Conditional |
| R-EP-16 | R-DPO-14 | Public verification LIA unsigned | **Medium** | Legal | Legal + DPO | Sign LIA or restrict external URL | **OPEN** | G-EP-11 | External URL blocked |
| R-EP-17 | R-DPO-16 | hCaptcha not configured for external | **Medium** | Security | Security | HCAPTCHA_SECRET; disable skip | **OPEN** | G-EP-08 | Public surfaces blocked |
| R-EP-18 | R-DPO-18 | DSR export E2E not proven | **Medium** | Privacy | DPO + Engineering | Prove DSR export workflow | **OPEN** | E2E evidence | DSR fulfillment risk |
| R-EP-19 | R-DPO-19 | Hosted retention automation not validated | **Medium** | Ops | Legal + Ops | Lifecycle jobs on hosted stack | **OPEN** | R-01 enforcement | Hosted disposal risk |
| R-EP-20 | R-DPO-20 | Verifier / ID reviewer training not delivered | **Medium** | Governance | Compliance | Training + attendance log | **OPEN** | G-EP-09 | **BLOCKER** |
| R-EP-21 | R-DPO-13 | Audit log erasure limitation undecided | **Medium** | Legal | DPO + Legal | Confirm LEG-20 exception scope | **OPEN** | Erasure policy | DSR conflict |
| R-EP-22 | F5-5 | Identity evidence upload UI partial | **Medium** | Privacy | Engineering | Complete upload UI; synthetic refs only local | **OPEN** | Track F5-5 corrective | IAL-2 operational |
| R-EP-23 | SD-R10 | Wrong-tenant staff probe HTTP 200 on overview | **Low** | Security | Engineering | Review tenant scoping on reports | **OPEN** | Investigate | Monitor only |
| R-EP-24 | SD-R11 | Smoke bypass misconfiguration risk | **High** | Security | IdP admin | Audit attributes; separation checks | **CONTROLLED** | Reject external if bypass detected | **BLOCKER** if misconfigured |
| R-EP-25 | SD-R07 | F5-5 R-M01 staff MFA not enforced (register) | **Medium** | Security | Security | **Superseded** by STAFF-MFA-3 | **MITIGATED** | Close in F5-5 register | N/A |
| R-EP-26 | SD-R12 | MFA closure linked browser evidence | **Low** | Ops | Engineering | TD-085 live run confirms baseline | **MITIGATED** | Accept linked + live TD-085 | N/A |

---

## Summary by severity (open risks only)

| Severity | Open | Mitigated / controlled |
|----------|-----:|-------------------------:|
| **High** | **12** | 2 (R-EP-24 controlled; R-EP-25 mitigated) |
| **Medium** | **10** | 0 |
| **Low** | **1** | 1 (R-EP-26 mitigated) |
| **Total tracked** | **23 open** | 3 closed/mitigated |

---

## Summary by domain (open)

| Domain | High | Medium | Low |
|--------|-----:|-------:|----:|
| Security | 2 | 3 | 1 |
| Privacy | 4 | 4 | 0 |
| Legal | 5 | 2 | 0 |
| Governance | 1 | 1 | 0 |
| Infra | 0 | 1 | 0 |
| Ops | 0 | 1 | 0 |

---

## High-risk items that must not be downgraded

The following remain **High** until signed evidence closes them:

- R-EP-01 through R-EP-12 (sign-offs, privacy gates, real PII, enrollment)  
- R-EP-24 (smoke bypass — controlled but High if misconfigured)

---

## Explicit non-claims

- No risk accepted or waived by this rollup  
- Residual risks are disclosed, not hidden  
- External pilot remains NO-GO regardless of local technical PASS items
