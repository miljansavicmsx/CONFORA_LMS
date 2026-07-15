# A-02-R1 STAFF-MFA-3 Rerun

**Rerun status:** `PARTIAL`

**Live evidence:** `docs/evidence/f5-pilot-readiness/2026-07-15T11-02-47-staff-mfa-3-enforcement-closure/`

**Script verdict (from that folder):** `STAFF_MFA_3_NO_GO_AUTH_OR_SECURITY_REGRESSION`

## API health

| Step | Result |
|------|--------|
| Preflight `http://127.0.0.1:4000/health` | DOWN |
| `npm run docker:up` | PASS (deps already/partially running; services started) |
| `npm run dev:api:pilot` | Started Nest watch API |
| Recheck `/health` | PASS — `{"status":"ok","service":"api",...}` |
| A-02-R1 `api_health_status` | **PASS** |

## Command

```text
npm run ops:staff-mfa-3-enforcement-closure
```

Env used for run (values not written to evidence): Keycloak admin from container env; `KEYCLOAK_BASE_URL=http://localhost:18080`; `NEST_API_URL=http://127.0.0.1:4000`.

## Security-relevant probe outcomes (safe)

| Check | Status | Notes |
|-------|--------|-------|
| Privileged route without MFA (EXTERNAL) | DENIED 403 | All five staff route probes 403 |
| Learner on staff route | DENIED 403 | PASS |
| Public verify | 200 / no PII fields | PASS |
| Smoke staff (`pilot.staff`) nest login after cleanup | loginOk=false | Expected — smoke bypass removed; password-only path no longer satisfies staff MFA |
| Privileged route with MFA | PARTIAL / empty routes | `nestMfaVerifyOk=false`; Keycloak direct-grant TOTP/`amr=otp` limitation |
| MFA claim status | PARTIAL | Same limitation |
| Regression suite | FAIL | `ops:f5-3-data-readiness` FAIL; MFA invariant guard FAIL |
| Invariant `smokeSeparationOk` | FAIL | Script requires `pilot.staff` still show `mfa_verified` via LOCAL smoke bypass |

## Why script NO_GO is not treated as silent MFA weaken

1. Smoking attributes were intentionally removed from external-facing enrolled staff (A-02 open condition).
2. STAFF-MFA-3 still treats `pilot.staff@confora.test` as LOCAL smoke control and requires `mfa_verified` via `pilot_smoke_mfa_verified` for `smokeSeparationOk`.
3. After cleanup, that expectation fails → script `NO_GO`, while denial-without-MFA and learner denial still hold.
4. Script also deleted OTP on `pilot.staff.mfa.external@confora.test` for without-MFA proof (cohort side effect).

## Keycloak direct-grant TOTP limitation

`true` — enrollment/TOTP grant path still does not reliably produce Nest MFA-complete tokens with `amr`/`mfa_verified` via direct grant on this Keycloak 26 local stack. Do **not** fake PASS for MFA route proof.

## TD-085

`NOT_RUN` — no production code or ops script source changes in A-02-R1; Keycloak state + evidence only. Unrelated `ops:f5-3-data-readiness` FAIL is not treated as MFA regression requiring TD-085 in this package.
