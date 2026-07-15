# TD-085-S17-R1 Report

**Final verdict:** `TD_085_S17_R1_GO_LOCAL_BASELINE_RESTORED`

## Root cause

Wrong frontend on `:3001` (admin instead of `frontend-app`) plus S17 `piiPass` incorrectly requiring Playwright success caused a **false** `NO_GO_PRIVACY_OR_GOVERNANCE_REGRESSION`. API public verify had no PII leaks. Nested f5-3 password-only 401s on MFA-enrolled staff amplified PARTIAL until made MFA-aware.

## Files changed

- `scripts/ops/run-s17-public-verify-browser.mjs`
- `scripts/ops/run-f5-3-data-readiness-check.mjs`

## Evidence folder

`docs/evidence/td-085-sequential-regression/2026-07-15T14-40-00-td-085-s17-r1-remediation/`

## Results

| Gate | Result |
|------|--------|
| S17 after fix | **PASS** — `S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED` |
| TD-085 after fix | **PASS** — `TD_085_GO_WITH_TRANSIENT_INFRA_NOTE` |
| Public verify no-auth | preserved |
| Public verify read-only | preserved |
| PII minimization | preserved |

## Not claimed

External pilot approved · Security delegate signed · DPO/legal signed · Real personal data approved · Staging/production validated
