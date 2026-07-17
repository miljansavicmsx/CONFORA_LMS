# APPEALS-COMPLAINTS-1R Report

| Field | Value |
|-------|-------|
| Evidence | `docs/evidence/appeals-complaints/2026-07-17T07-12-01-appeals-complaints-1r-browser/` |
| Based on | `74e133a` |
| Browser | `PASS` |
| Verdict | `APPEALS_COMPLAINTS_1R_GO_BROWSER_CONFIRMED` |
| Frontend | `/dashboard/appeals-complaints` |
| Support | `/dashboard/support` |

## Files changed (implementation)

- `frontend-app/e2e/appeals-complaints-1r.spec.ts` (new)
- `scripts/ops/run-appeals-complaints-1r-browser.mjs` (new)
- `package.json` (`ops:appeals-complaints-1r-browser`)
- `frontend-app/playwright.config.ts` (pilot Nest auth / 1R port support)
- `frontend-app/src/components/grievances/FormalComplaintDialog.tsx` (testid polish)
- `frontend-app/src/lib/api/complaints-client.ts` (subject mapping — no raw enums)
- `frontend-app/src/lib/api/__tests__/complaints-client.test.ts` (coverage)

## Claims not made

- External pilot approved: **no**
- Security delegate signed: **no**
- DPO/legal signed: **no**

## Recommendation

Browser foundation confirmed with encoding/label hygiene. Next optional step: staff resolution UX (still deferred). Full appeal submit can be re-run when `PLAYWRIGHT_APPEAL_DECISION_ID` is available.
