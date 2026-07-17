# Browser results

| Check | Status |
|-------|--------|
| Playwright | **PASS** (2/2) |
| Browser status | **PASS** |
| Learner route `/dashboard/appeals-complaints` | **CONFIRMED** |
| Žalbe tab | **CONFIRMED** |
| Prigovori tab | **CONFIRMED** |
| Boundary copy (appeal ≠ complaint) | **CONFIRMED** |
| Support `/dashboard/support` separate | **CONFIRMED** |
| Complaint submit + success toast | **CONFIRMED** |
| Appeal dialog labels (no raw enums) | **CONFIRMED** |
| Appeal submit | **SKIPPED** (`PLAYWRIGHT_APPEAL_DECISION_ID` not set — no decision fixture) |
| Raw enums after label fix | **none visible** |
| Encoding / diacritics | **PASS** |

Auth pattern: EXAM-REG-1-E2E-AUTH-RECOVERY (Vite :3011, `VITE_AUTH_PROVIDER=nest`, password from env only).

Logs: `bounded-logs/playwright-appeals-complaints-1r.log` (no secrets).
