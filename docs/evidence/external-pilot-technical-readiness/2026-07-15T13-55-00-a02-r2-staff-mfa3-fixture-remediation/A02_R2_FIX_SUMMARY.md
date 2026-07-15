# A-02-R2 Fix Summary

**Changed file:** `scripts/ops/run-staff-mfa-3-enforcement-closure.mjs`  
**Production code / Prisma / migrations / API contracts:** unchanged

## Fixture model

| Fixture | Email | Purpose |
|---------|-------|---------|
| External-ready cohort (OTP read-only) | manager, staff, director, `pilot.mfa.staff@`, `pilot.staff.mfa.external@` | Preserve real OTP; never delete/overwrite |
| No-MFA denial | `pilot.staff.no-mfa@confora.test` | Local-only COM_CERT without OTP; not external-pilot-ready |
| MFA route-proof | `pilot.staff.mfa.route-proof@confora.test` | Local-only test TOTP for direct-grant/Nest MFA attempts |

## Guards added

- `EXTERNAL_READY_STAFF` protected list  
- `deleteOtpCredentials` / `enrollTotpCredential` / fixture ensure refuse mutations on protected users  
- Smoke attributes never restored (`withSmokeBypass` refused)  
- Before/after snapshots (`external-ready-otp-before.json` / `after.json`); fail with `DESTRUCTIVE_FIXTURE_REGRESSION` if OTP lost or smoke reintroduced  

## Invariant update

`smokeSeparationOk` now means:

- no-MFA fixture is separate and has no OTP  
- external-ready cohort has 5/5 OTP and no smoke  
- without-MFA denial still 403; learner denial still pass  

## Targeted tests (package)

- `apps/api` Jest: `mfa.guard.spec.ts` — PASS (2)  
- `@confora/shared-types` `auth.mfa.spec.ts` — PASS (4)  
