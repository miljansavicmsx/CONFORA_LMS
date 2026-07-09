# TD-084 RBAC & Privacy Results

## API-level probes (clean rerun)

| Probe | Expected | Result |
|-------|----------|--------|
| Staff reports export (learner token) | 403 | PASS |
| Staff identity review queue | 403 | PASS |
| Learner staff role denied in JWT | true | PASS |
| Tenant present in /auth/me | true | PASS |

## Playwright RBAC negative

Learner blocked from:

- `/dashboard/admin/reports`
- `/dashboard/admin/identity-review`
- `/dashboard/director`
- `/dashboard/committee`

All redirected to safe denial routes (`/dashboard`, `/unauthorized`, `/login`). **PASS**

## Privacy

| Check | Status |
|-------|--------|
| No raw enum tokens in UI | PASS |
| Public verify: no JMBG/DOB/email/audit payload | PASS |
| Wallet: no forbidden internal keys | PASS (from TD-083 probes, unchanged) |
| Education boundary messaging preserved | PASS |

## Governance boundaries

| Control | Weakened? |
|---------|-----------|
| RBAC | false |
| Tenant isolation | false |
| Privacy | false |
| Education/certification boundary | false |

**Overall rbac_privacy_status: PASS**
