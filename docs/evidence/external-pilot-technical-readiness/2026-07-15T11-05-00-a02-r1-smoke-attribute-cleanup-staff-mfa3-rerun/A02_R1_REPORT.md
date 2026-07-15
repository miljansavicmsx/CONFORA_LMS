# A-02-R1 Report — Smoke Attribute Cleanup and STAFF-MFA-3 Rerun

**Final verdict:** `A02_R1_PARTIAL_STAFF_MFA3_RERUN_BLOCKED_OR_PARTIAL`

**Branch:** `fix/ca-h01-frontend-f4-cutover`

## Objective completed?

| Objective | Result |
|-----------|--------|
| Remove smoke MFA bypass from manager/staff/director | **DONE** (0 smoke on five external-facing users after cleanup) |
| Keep real OTP on enrolled staff through cleanup | **PASS** at cleanup (5/5) |
| OTP still 5/5 after STAFF-MFA-3 | **FAIL** — EXTERNAL OTP deleted by closure script (final 4/5) |
| API healthy + STAFF-MFA-3 rerun | API **PASS**; STAFF-MFA-3 **PARTIAL** (script NO_GO; denials hold; MFA route PARTIAL) |
| Security delegate signature | **NOT created / not claimed** |

## Smoke cleanup before → after

| Metric | Before cleanup | After cleanup | After STAFF-MFA-3 |
|--------|----------------|---------------|-------------------|
| Users with smoke bypass (cohort of 5) | 3 (manager, staff, director) | 0 | 0 |
| Users with OTP type | 5 | 5 | 4 |

## OTP reverify

- Cleanup checkpoint: **5/5 OTP**, smoke absent
- Final live state: **4/5 OTP** (`pilot.staff.mfa.external@confora.test` password-only after script)

## API / STAFF-MFA-3

- Health: **PASS** after `docker:up` + `dev:api:pilot`
- Evidence: `docs/evidence/f5-pilot-readiness/2026-07-15T11-02-47-staff-mfa-3-enforcement-closure/`
- Without-MFA staff routes: **403**
- With-MFA route proof: **PARTIAL** (Keycloak direct-grant limitation)
- Script final_verdict: `STAFF_MFA_3_NO_GO_AUTH_OR_SECURITY_REGRESSION` driven largely by failed `smokeSeparationOk` after intentional smoke removal

## Why not GO

`A02_R1_SECURITY_CONDITIONS_GO_READY_FOR_SECURITY_DELEGATE_SIGNOFF` requires 5/5 OTP remaining **and** STAFF-MFA-3 PASS (or PARTIAL only for documented direct-grant limitation with invariants pass). Final OTP is 4/5 and script invariants did not pass under the post-cleanup smoke model.

## Governance boundaries (unchanged claims)

| Claim | Value |
|-------|-------|
| security_delegate_signed | false |
| external_pilot_approved | false |
| dpo_legal_signed | false |
| real_personal_data_approved | false |
| staging_validated_claimed | false |
| production_ready_claimed | false |
| privacy / RBAC / tenant / MFA / audit / governance weakened | false |
| prisma / migrations / API contracts / production code / ops scripts changed | false |

## Recommended next action

Re-enroll EXTERNAL OTP → consider STAFF-MFA-3 control-user split → return security delegate to A-02 package with A-02-R1 residuals attached. **Do not sign** until human security delegate completes the template.
