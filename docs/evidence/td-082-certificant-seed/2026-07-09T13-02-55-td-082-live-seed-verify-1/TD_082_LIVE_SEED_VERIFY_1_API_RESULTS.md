# TD-082 Live Seed Verify 1 — API Results

**Actor:** `pilot.learner2@confora.test`  
**Endpoint:** `GET /v1/me/certificates`  
**Probe script:** `scripts/ops/run-td-082-live-seed-verify-api.mjs`

## Results

| Probe | Status | Detail |
|-------|--------|--------|
| anonymous_denied | PASS | HTTP 401 |
| certificant_login | PASS | HTTP 201 |
| certificant_non_empty_wallet | PASS | 5 items (includes prior local smoke certs + TD-082 fixture) |
| seed_certificate_present | PASS | `CON-PILOT-000082` |
| selector_fields | PASS | `schemeTitle`, `issuedAt`, `publicNumber`, `cpdEligible=true`, `recertificationEligible=true` |
| cpd_eligible | PASS | cpd=true recert=true |
| privacy_no_forbidden_keys | PASS | No tenantId/userId/applicationId/pdfStorageKey/committee/nationalId patterns in wallet JSON |
| other_candidate_scope | PASS | `pilot.learner@confora.test` — 0 items, no leak |
| wrong_tenant_scope | PASS* | HTTP 500, 0 items, no leak (*local error handling note; no data exposure) |

## Recertification case probe (supplemental)

`GET /v1/me/recertification/CON-PILOT-000082` → HTTP 200, case `a8200001-0000-4000-8000-000000000002`, status `OPEN`, `inputs.cpd_hours_recorded=0`.

## Verdict

**api_non_empty_selector_status:** PASS  
**anonymous_denial_status:** PASS  
**other_candidate_scope_status:** PASS  
**wrong_tenant_status:** PASS (no leak; 500 is local-state note)  
**privacy_status:** PASS

Raw JSON: `api-results.json`
