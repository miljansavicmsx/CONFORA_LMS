# STAFF-MFA-3 Residual Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Manual TOTP enrollment not completed for all external staff | Medium | Security delegate sign-off gate; enrollment checklist |
| Smoke bypass attribute misapplied to external user | High | Ops script verifies separation; remove attribute before cutover |
| Password-only grant on enrolled user if Keycloak flow misconfigured | Medium | `passwordOnlyBlocked` probe in enrollment JSON |
| DPO/legal not reviewed | Medium | Explicitly not claimed in this task |
| Staging/hosted Keycloak not validated here | Low | Local baseline only — `TD_085_GO_LOCAL_BASELINE_CONFIRMED` prerequisite |

**Security delegate signoff required:** yes  
**External pilot approved:** no  
**DPO/legal signoff claimed:** no
