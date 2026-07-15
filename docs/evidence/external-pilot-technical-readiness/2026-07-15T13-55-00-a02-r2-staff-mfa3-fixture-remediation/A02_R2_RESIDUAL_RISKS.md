# A-02-R2 Residual Risks

1. **TD-085 sequential regression FAIL** — S17 reported privacy/governance NO_GO; admin/learner/f4-9 also failed. Not attributed to MFA fixture mutation (OTP 5/5 preserved; smoke absent). Must be cleared before full GO / delegate completion.

2. **Keycloak direct-grant TOTP/`amr` limitation** — with-MFA privileged route proof remains PARTIAL.

3. **EXTERNAL authenticator alignment** — OTP credential type restored for EXTERNAL after A-02-R1 destructive delete; operator should confirm device secret matches live Keycloak if A-01-R4 secret differed.

4. **Wrong-tenant smoke still possible** — `pilot.staff.wrong-tenant@confora.test` outside five-user cohort may still carry local smoke claims; not remediated here.

5. **Governance claims still open** — security delegate, external pilot, DPO/legal, real personal data, staging/production remain unsigned / not approved.

## Explicitly not claimed

Security delegate signed · External pilot approved · DPO/legal signed · Real personal data approved · Staging/production validated
