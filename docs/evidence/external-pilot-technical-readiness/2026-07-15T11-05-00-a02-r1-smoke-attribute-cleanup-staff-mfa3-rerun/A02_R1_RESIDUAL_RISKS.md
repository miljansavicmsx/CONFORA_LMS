# A-02-R1 Residual Risks

## Open / residual

1. **STAFF-MFA-3 script vs smoke-cleanup conflict**  
   Closure script still expects LOCAL smoke bypass on `pilot.staff@confora.test`. After A-02-R1 cleanup, invariant `smokeSeparationOk` fails and script verdict is NO_GO even though without-MFA denial still works.

2. **EXTERNAL OTP deleted by STAFF-MFA-3**  
   `pilot.staff.mfa.external@confora.test` lost OTP credential type during rerun (`deleteOtpCredentials`). A-01-R4 5/5 enrollment is no longer true in live Keycloak until operator re-enrolls EXTERNAL (without committing secrets).

3. **Keycloak 26 direct-grant TOTP / `amr` limitation**  
   MFA route proof remains PARTIAL; Nest MFA verify did not succeed in this rerun. Do not treat PARTIAL as PASS.

4. **Dedicated control-user gap**  
   EXTERNAL is dual-used as (a) enrolled external-facing staff and (b) without-MFA denial fixture. Recommend a separate non-cohort denial user for future STAFF-MFA-3 runs so enrollment is not destroyed.

5. **wrong-tenant staff still smoke-capable**  
   Probe showed `pilot.staff.wrong-tenant@confora.test` with `mfa_verified=true` without `amr` OTP — outside the five-user cleanup scope; residual local-smoke hygiene for non-cohort accounts.

6. **Unrelated regression noise**  
   `ops:f5-3-data-readiness` FAIL contributed to full regression FAIL; not remapped as MFA control weaken here.

## Explicitly not claimed

- Security delegate signed
- External pilot approved
- DPO/legal signed
- Real personal data approved
- Staging / production validated or ready
- MFA controls weakened (cleanup removes bypass; denials still hold)

## Recommended next actions

1. Operator re-enroll `pilot.staff.mfa.external@confora.test` with real TOTP (no secrets in git).
2. Adjust STAFF-MFA-3 (future ops task) to use a dedicated no-OTP denial user and/or accept smoke-free enrolled staff.
3. Security delegate reviews A-02 + A-02-R1 with residual conditions visible (still **unsigned** until human action).
