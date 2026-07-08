# LOCAL_PILOT_FINAL_ROLLUP_1 Residual Risks

| # | Risk | Severity | Impact | Mitigation / next action |
|---|------|----------|--------|--------------------------|
| 1 | Staff MFA manual enrollment and enforcement not complete for external-facing privileged staff | **Blocker (external)** | External pilot NO-GO | Security delegate sign-off; manual TOTP enrollment per STAFF_MFA_2 evidence |
| 2 | DPO/legal decision session pending (lawful basis, retention, DSR, DPIA) | **Blocker (external)** | External pilot NO-GO; internal conditional | Convene DPO/legal session; complete sign-off register |
| 3 | Retention schedule documented only — not DPO-approved | Medium | GDPR compliance gap | Retention approval register sign-off |
| 4 | DSR procedure deferred / gap blockers documented | Medium | Subject rights handling | Approve DSR procedure; implement export case linkage |
| 5 | DPIA decision pending | Medium | High-risk processing unclear | Formal DPIA or documented no-DPIA decision |
| 6 | F5-5 residual security/privacy gaps (H=1, M=4, L=3) | Medium | Tracked corrective actions | Address open risks in F5-5 matrix; no weakening |
| 7 | External/staging/production environment not validated | **Blocker (external)** | Cannot claim hosted pilot | Separate EP-TECH / infra evidence required |
| 8 | Evidence is local/synthetic pilot data only | Low | Not representative of production load/tenancy | Label all demos; no production claims |
| 9 | Security delegate MFA decision pending | Medium | External gate | Document delegate approval |
| 10 | Identity evidence workflow partial (staff-only; no biometrics claimed) | Low | Operational clarity | Continue staff-only manual review path |

**Residual risks count:** 10  
**Blocker risks count:** 3 (MFA enforcement, DPO/legal approval, external environment)

No RBAC, tenant isolation, privacy, audit, or governance boundary weakening is claimed or permitted by this rollup.
