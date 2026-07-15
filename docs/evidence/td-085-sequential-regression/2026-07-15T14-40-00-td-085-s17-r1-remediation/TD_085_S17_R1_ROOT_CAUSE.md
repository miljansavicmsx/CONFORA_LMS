# TD-085-S17-R1 Root Cause

**root_cause_type:** `ENVIRONMENT` + `SCRIPT_FIXTURE` (cascading)

## Primary (environment)

Wrong frontend on port **3001**:

- Required: `frontend-app` (Vite public verify UI, `/verify` → 200)
- Present during A-02-R2 TD-085: `apps/admin` (Next) → `/verify` 404

Consequence: Playwright public-verify walkthrough failed; screenshots empty; S17 marked browser privacy/read-only FAIL.

## Secondary (script fixture / verdict mapping)

In `scripts/ops/run-s17-public-verify-browser.mjs`, `piiPass` incorrectly required Playwright success:

```text
piiPass = apiPrivateHitsEmpty && pw.pass
```

When Playwright failed for env reasons, S17 emitted `S17_PUBLIC_VERIFY_BROWSER_NO_GO_PRIVACY_OR_GOVERNANCE_REGRESSION` even though API private-field scans had **zero** hits. TD-085 then classified that child verdict as privacy/governance regression.

## Tertiary (nested regression noise)

After real OTP enrollment + smoke cleanup, `ops:f5-3-data-readiness` treated password-only Nest login **401** on MFA-enrolled staff as hard FAIL, cascading S17 nested `regressionPass` and local pilot RBAC matrix checks.

## Not a real public-verification privacy leak

Public verify API returned approved contract keys only; forbidden keys (email, jmbg, review notes, etc.) were not exposed. This was a **false-positive** privacy NO-GO, not a PII exposure regression.
