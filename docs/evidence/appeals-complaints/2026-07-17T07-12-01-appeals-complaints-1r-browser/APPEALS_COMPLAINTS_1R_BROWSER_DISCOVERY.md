# APPEALS-COMPLAINTS-1R Browser Discovery

| Item | Value |
|------|-------|
| Based on | `74e133a` |
| Prior verdict | `APPEALS_COMPLAINTS_1_GO_FOUNDATION_CONFIRMED` |
| Stack PG/KC/API | UP |
| Auth (KC + Nest login + /me) | PASS |
| Password env | present (`PLAYWRIGHT_PILOT_PASSWORD` / `PILOT_USER_PASSWORD`) — value not recorded |
| frontend-app/.env.local | existing (not committed) |
| Playwright port pattern | 3011 + `VITE_AUTH_PROVIDER=nest` |

## Approach

Reuse EXAM-REG-1-E2E-AUTH-RECOVERY local pilot auth: controlled Vite on **3011**, Nest auth, password from env only.

## Scope exercised

1. Login as `pilot.learner@confora.test`
2. Visit `/dashboard/appeals-complaints`
3. Confirm Žalbe / Prigovori tabs and boundary notices
4. Confirm `/dashboard/support` remains separate
5. Submit one learner complaint (success toast + list card)
6. Open appeal dialog; full appeal submit deferred without decision UUID fixture
7. Encoding + raw-enum checks

## Label defect discovered in-run

Complaint list card titles showed `PROCESS_COMPLAINT` until client subject mapping was corrected (see `APPEALS_COMPLAINTS_1R_ENCODING_LABELS.md`).
