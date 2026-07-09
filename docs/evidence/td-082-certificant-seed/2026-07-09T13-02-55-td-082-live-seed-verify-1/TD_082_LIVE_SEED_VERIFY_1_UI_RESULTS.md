# TD-082 Live Seed Verify 1 — UI Results

**URL:** http://127.0.0.1:3001/dashboard/my-recertifications  
**Actor:** `pilot.learner2@confora.test`  
**Tool:** Playwright `frontend-app/e2e/td-082-live-seed-verify-1.spec.ts`

## Test 1 — Selector without `?certificateId=`

| Check | Status |
|-------|--------|
| Page loads | PASS |
| `certificate-selector` visible | PASS |
| `certificate-selector-empty` absent | PASS |
| `certificate-selector-fallback-hint` absent | PASS |
| `CON-PILOT-000082` in options | PASS |
| Manual select when multiple eligible certs (5) | PASS (expected; auto-select only for single eligible) |
| `certificate-selector-summary` visible after select | PASS |
| `cpd-recert-panel` visible | PASS |
| `cpd-hours-input` visible and usable | PASS |

## Test 2 — Fallback hint with query param

| Check | Status |
|-------|--------|
| `?certificateId=CON-PILOT-000082` loads selector | PASS |
| `certificate-selector-fallback-hint` visible | PASS |

## Playwright output

```
2 passed (20.8s)
```

## Verdict

**ui_selector_non_empty_status:** PASS  
**fallback_not_required_status:** PASS
