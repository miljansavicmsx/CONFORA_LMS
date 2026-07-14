# DPO-LEGAL-SIGNOFF-1 — Residual Risks Register

**Task:** DPO-LEGAL-SIGNOFF-1  
**Date:** 2026-07-14  
**Status:** Open risks for DPO/legal review — **not mitigated by sign-off**

Prior registers: F5-5 `F5_5_OPEN_RISKS_AND_CORRECTIVE_ACTIONS.md`; SECURITY-DELEGATE-SIGNOFF-1 residual risks.

---

## Risk register

| Risk ID | Title | Severity | Owner | Mitigation (current/planned) | Required decision | Status | External pilot impact |
|---------|-------|----------|-------|------------------------------|-------------------|--------|----------------------|
| R-DPO-01 | DPO/legal sign-off pending | **High** | DPO + Legal | This review package prepared | Complete sign-off template | **OPEN** | **BLOCKER** — external pilot blocked |
| R-DPO-02 | DPIA decision pending | **High** | DPO | Scoping note + formal assessment draft | Execute DPIA or signed no-DPIA decision | **OPEN** | **BLOCKER** — G-EP-05 |
| R-DPO-03 | Retention schedule unsigned | **High** | Legal + DPO | R-01–R-16 proposed in register | Sign RETENTION_APPROVAL_REGISTER | **OPEN** | **BLOCKER** — G-EP-03 |
| R-DPO-04 | DSR procedure unsigned / partial | **High** | DPO + Legal | DSR_PROCEDURE.md draft | Approve procedure; prove E2E export | **OPEN** | **BLOCKER** — G-EP-04 |
| R-DPO-05 | Processor / DPA status pending | **High** | Legal | Draft subprocessor list | Complete DPAs for hosted stack | **OPEN** | **BLOCKER** — G-EP-10 |
| R-DPO-06 | Legal basis register unsigned (LB-01–LB-15) | **High** | Legal counsel | Workshop positions documented | Counsel sign-off; Art. 9 resolve | **OPEN** | **BLOCKER** — G-EP-02 |
| R-DPO-07 | Security delegate sign-off pending | **Medium** | Security delegate | SECURITY-DELEGATE-SIGNOFF-1 package | Security delegate signature | **OPEN** | **BLOCKER** for G-EP-07 closure |
| R-DPO-08 | Manual TOTP enrollment pending for external staff | **Medium** | Security + Ops | STAFF-MFA-3 enforcement; enrollment runbook | Operational enrollment before external staff use | **OPEN** | Conditional — staff access risk |
| R-DPO-09 | External pilot not approved | **High** | DPO + Legal + Director | L5 decision record BLOCKED | Clear 11/11 gate conditions | **OPEN** | **BLOCKER** |
| R-DPO-10 | Staging/production not validated | **Medium** | Ops + Legal | Local TD-085 baseline only | Staging policy + validation (STG-001) | **OPEN** | External hosted deployment blocked |
| R-DPO-11 | Real personal data not approved for use | **High** | DPO + Legal | CLRC synthetic-only local pilot | Explicit authorization for external real PII | **OPEN** | **BLOCKER** |
| R-DPO-12 | ID document handling retention unresolved | **High** | DPO + Legal | R-01 14d proposed; manual IAL-2 only | Sign retention; IAL-2 validation G-EP-06 | **OPEN** | **BLOCKER** — Art. 9 risk |
| R-DPO-13 | Audit log erasure limitation requires legal decision | **Medium** | DPO + Legal | Append-only technical control; LEG-20 draft | Confirm erasure exception scope | **OPEN** | DSR conflict risk |
| R-DPO-14 | Public verification LIA unsigned | **Medium** | Legal + DPO | S17 technical minimization GO | Sign LIA or restrict external URL | **OPEN** | G-EP-11 blocker if external |
| R-DPO-15 | Privacy notice / GDPR policy not published | **High** | DPO + Legal + Director | CONFORA_GDPR_POLICY draft | G-EP-01 sign-off and publication | **OPEN** | **BLOCKER** |
| R-DPO-16 | hCaptcha not configured for external | **Medium** | Security | G-EP-08 requirement | Configure HCAPTCHA; disable skip | **OPEN** | External public surfaces blocked |
| R-DPO-17 | GDPR policy compliance claimed — FALSE | **High** | DPO | F5-5 PARTIAL; legal docs draft | No compliance claim until signed | **OPEN** | Reputational / regulatory |
| R-DPO-18 | DSR export E2E not proven | **Medium** | DPO + Engineering | F5-5 residual | Prove export workflow | **OPEN** | DSR fulfillment risk |
| R-DPO-19 | Hosted retention automation not validated | **Medium** | Legal + Ops | DOCUMENTED_ONLY per F5-5 | Implement and test lifecycle jobs | **OPEN** | R-01 enforcement risk |
| R-DPO-20 | Verifier / ID reviewer training not delivered | **Medium** | Compliance | Training materials draft | G-EP-09 attendance log | **OPEN** | G-EP-09 blocker |

---

## Summary by severity

| Severity | Open count |
|----------|----------:|
| High | 10 |
| Medium | 10 |
| Low | 0 |

---

## Blocker risks for external pilot (minimum)

The following must close or receive **formal written waiver** before external hosted pilot with real candidates:

1. R-DPO-01 — DPO/legal sign-off  
2. R-DPO-02 — DPIA decision  
3. R-DPO-03 — Retention schedule  
4. R-DPO-04 — DSR procedure  
5. R-DPO-05 — Processor DPAs  
6. R-DPO-06 — Legal basis register  
7. R-DPO-09 — External pilot gate  
8. R-DPO-11 — Real personal data authorization  
9. R-DPO-12 — ID document handling  
10. R-DPO-15 — Privacy notice publication  

Plus G-EP-07 (security delegate), G-EP-08 (hCaptcha), G-EP-09 (training), G-EP-11 (LIA) as applicable.

---

## Explicit non-claims

- No risk is **accepted** or **closed** by this package.  
- No waiver has been **granted**.  
- Residual risks are **disclosed**, not hidden.
