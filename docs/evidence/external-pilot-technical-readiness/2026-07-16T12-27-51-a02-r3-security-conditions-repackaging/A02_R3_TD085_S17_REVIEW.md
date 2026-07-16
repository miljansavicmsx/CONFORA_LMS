# A-02-R3 — TD-085 / S17 Review

## Prior failure (A-02-R2 era)

| Item | Value |
|------|-------|
| Evidence | `docs/evidence/td-085-sequential-regression/2026-07-15T13-32-47-td-085/` |
| Verdict | `TD_085_NO_GO_RBAC_PRIVACY_OR_GOVERNANCE_REGRESSION` |
| Driver | S17 privacy mapping via Playwright/`piiPass` coupled to wrong app on `:3001` |

## TD-085-S17-R1 remediation (confirmed)

| Item | Value |
|------|-------|
| Evidence | `2026-07-15T14-40-00-td-085-s17-r1-remediation/` |
| Commits | `119a117` (fix), `77ee392` (live PASS evidence) |
| Root cause type | ENVIRONMENT (+ script fixture secondary) |
| S17 after fix | **PASS** — `S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED` |
| S17 live evidence | `docs/evidence/f5-pilot-readiness/2026-07-15T14-27-15-s17-public-verify-browser/` |
| TD-085 after fix | **PASS** — `TD_085_GO_WITH_TRANSIENT_INFRA_NOTE` |
| TD-085 live evidence | `docs/evidence/td-085-sequential-regression/2026-07-15T14-31-08-td-085/` |
| Package verdict | `TD_085_S17_R1_GO_LOCAL_BASELINE_RESTORED` |

## Privacy controls preserved (S17 live)

| Control | Status |
|---------|--------|
| Public route no-auth | **PASS** |
| Read-only | **PASS** |
| PII minimization | **PASS** |
| Private field exposures (email/jmbg/etc.) | all **false** |
| Private dashboard data exposed | **false** |

## Current TD-085 status for A-02-R3

**`PASS_WITH_TRANSIENT_INFRA_NOTE`**

Live TD-085 (`14-31-08`) recorded transient infra FAIL on `admin-gov` and `f4-9` while f4-audit, f5-3, S17, and learner **PASS**. Mapped overall verdict: `TD_085_GO_WITH_TRANSIENT_INFRA_NOTE`. No privacy/RBAC/governance regression claimed after S17-R1.

## Claims not made

- External pilot approved: **false**
- Security delegate signed: **false**
- DPO/legal signed: **false**
- Staging/production validated: **false**
