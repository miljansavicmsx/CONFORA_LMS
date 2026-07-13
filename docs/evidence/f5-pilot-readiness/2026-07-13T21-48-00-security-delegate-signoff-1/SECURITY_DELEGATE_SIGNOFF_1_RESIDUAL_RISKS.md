# SECURITY-DELEGATE-SIGNOFF-1 — Residual Risks

Risks are **explicit** and must not be hidden for sign-off convenience. Severity: Critical / High / Medium / Low.

| ID | Risk | Severity | Owner | Mitigation | Required decision | Status |
|----|------|----------|-------|------------|-------------------|--------|
| SD-R01 | Manual TOTP enrollment not completed for all external-facing staff | **High** | Program owner + IT/IdP | Execute STAFF-MFA-3 enrollment checklist per user; remove smoke bypass | Defer external staff access until enrolled | **Open** |
| SD-R02 | Security delegate sign-off pending | **High** | Security delegate | Complete sign-off template in this package | Accept/reject/conditional MFA gate | **Open** |
| SD-R03 | DPO/legal privacy review pending | **High** | DPO / Legal | DPO-LEGAL-2 session; privacy impact assessment | External pilot blocked until cleared | **Open** |
| SD-R04 | Automated OTP `amr` proof partial (Keycloak 26) | **Medium** | Engineering | Interactive TOTP enrollment; document in evidence; no fake MFA | Accept partial for internal pilot; require manual proof for external | **Open — accepted limitation** |
| SD-R05 | F5-5 GDPR/privacy readiness partial | **Medium** | DPO + Engineering | Close F5-5 residual gaps; identity evidence hardening | Security delegate acknowledges partial GDPR posture | **Open** |
| SD-R06 | F5-5 R-H01 legacy admin report/export GET paths | **Medium** | Engineering | CA-H01 cutover (closed in rollup); verify no regression | Confirm mitigated or track as residual | **Partially mitigated** |
| SD-R07 | F5-5 R-M01 staff MFA not enforced (register entry) | **Medium** | Security | **Superseded** by STAFF-MFA-3 enforcement evidence | Close R-M01 in risk register after delegate sign-off | **Mitigated — pending register update** |
| SD-R08 | Staging/production not validated | **Medium** | Platform | Hosted staging evidence (EP-TECH series) not claimed here | Do not claim staging/production ready | **Open** |
| SD-R09 | External pilot not approved | **High** | Program governance | Maintain EXTERNAL_PILOT_NO_GO until all gates pass | No external pilot launch | **Open — by design** |
| SD-R10 | Wrong-tenant staff probe HTTP 200 on overview | **Low** | Engineering | Review tenant scoping on reports overview; F5-3 boundary tests | Monitor; not a blocker for MFA gate alone | **Open — investigate** |
| SD-R11 | Smoke bypass misconfiguration on external user | **High** | IdP admin | Ops separation checks; attribute audit before cutover | Reject external pilot if bypass detected | **Controlled — verified absent on external user** |
| SD-R12 | MFA closure uses linked browser evidence by default | **Low** | Engineering | TD-085 2026-07-13 live sequential confirms baseline | Accept linked evidence for MFA package | **Mitigated by TD-085 live run** |

---

## Risk summary

| Severity | Open | Mitigated / partial |
|----------|------|---------------------|
| Critical | 0 | 0 |
| High | 4 | 1 (R11 controlled) |
| Medium | 5 | 2 |
| Low | 2 | 1 |

---

## Conditions typically required before external pilot

1. SD-R01 closed — all external-facing staff TOTP enrolled  
2. SD-R02 closed — security delegate signed with explicit decision  
3. SD-R03 closed — DPO/legal sign-off  
4. SD-R08 addressed — staging validation per platform plan  
5. SD-R09 lifted only by program governance after 1–4  

---

## Not claimed

- External pilot approved  
- Production ready  
- Staging validated (unless separate EP-TECH evidence provided)  
- DPO/legal approval  
- Zero residual risk  
