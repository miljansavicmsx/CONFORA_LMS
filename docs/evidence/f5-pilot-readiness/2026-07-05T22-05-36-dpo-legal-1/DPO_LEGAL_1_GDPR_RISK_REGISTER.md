# DPO-LEGAL-1 GDPR Risk Register

| ID | Risk | Severity | Likelihood | Mitigation (technical) | Owner (placeholder) | External pilot impact | Required decision |
|----|------|----------|------------|------------------------|---------------------|----------------------|-------------------|
| R-DPO-01 | Public verification field overexposure | Medium | Low | S17 PASS; consent-gated name; forbidden field scan | DPO + Product | Blocker until public fields approved | Approve public field whitelist |
| R-DPO-02 | Export excessive data | Medium | Low | Column allowlists; forbidden columns; POST-only export; learner 403 | DPO + Security | Blocker until export columns approved | Approve governance export use |
| R-DPO-03 | Identity evidence retention undefined | High | Medium | Staff-only access; no public/export exposure; synthetic pilot | DPO + COM_CERT | **Blocker** | Retention + lawful basis for ID docs |
| R-DPO-04 | Audit log overcollection | Medium | Medium | Redaction; 90d export cap; actorReference not raw email | DPO + STAFF_SYSADM | Blocker until retention approved | Audit retention schedule |
| R-DPO-05 | Smoke evidence retention in git | Low | Low | Redaction rules; no secrets in evidence | Engineering + DPO | Medium | Approve evidence retention policy |
| R-DPO-06 | Role / tenant leakage | High | Low | F5-5 PASS; wrong-tenant denial; JWT tenant scope | Security | Low if regressions hold | Periodic recheck |
| R-DPO-07 | MFA partial enforcement | Medium | Medium | MfaGuard verified; external user 403; manual TOTP pending | Security delegate | **Blocker** | MFA enrollment or risk acceptance |
| R-DPO-08 | Data subject rights manual only | High | Medium | DSR procedure draft exists | DPO | **Blocker** | Approve manual DSR procedure |
| R-DPO-09 | DPO/legal review pending | High | Certain | This review package | DPO / Legal | **Blocker** | Complete checklist sign-off |
| R-DPO-10 | Erasure vs certification retention conflict | High | Medium | Documented open — no auto-erasure | DPO / Legal | **Blocker** | Legal position on LEG-18–21 |

**No GDPR compliance claim. No legal approval claim.**
