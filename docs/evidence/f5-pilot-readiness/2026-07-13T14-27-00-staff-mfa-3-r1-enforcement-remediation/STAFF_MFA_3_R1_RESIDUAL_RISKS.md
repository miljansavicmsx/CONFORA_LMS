# STAFF-MFA-3-R1 Residual Risks

| Risk | Severity | Status |
|------|----------|--------|
| Manual interactive TOTP enrollment for external-facing staff | Medium | Open — checklist in STAFF-MFA-3 closure |
| Keycloak 26 automated direct-grant TOTP + amr evidence | Low | Known limitation; not a bypass |
| Security delegate sign-off unsigned | Medium | Required |
| DPO/legal review | Medium | Not claimed |
| MFA closure script no longer runs live S17 by default | Low | Linked TD-085 evidence; opt-in live via env flag |

## Not claimed

- External pilot approved
- Production / staging ready
- DPO/legal signoff

**security_delegate_signoff_required:** true
