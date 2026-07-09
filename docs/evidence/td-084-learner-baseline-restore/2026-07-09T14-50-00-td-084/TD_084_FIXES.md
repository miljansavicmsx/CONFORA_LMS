# TD-084 Fixes

**No production code changes required.**

TD-084 clean rerun passed 11/11 learner screens without modifying application code, tests, or ops scripts.

## Action taken

1. Compared prior GO evidence vs TD-083 NO-GO evidence
2. Verified stack health (API, frontend, Keycloak)
3. Re-ran `ops:learner-final-acceptance-1` in isolation (no parallel Playwright)
4. Confirmed baseline restored

## Prior fixes still in effect (from LEARNER-FINAL-ACCEPTANCE-1R, 2026-07-08)

These were already applied before TD-083 and remain valid:

| Area | Fix |
|------|-----|
| Katalog | Separate waits for page shell vs list/empty state |
| RBAC negative | `expectStaffRouteDenied` accepts `/unauthorized` |
| Moje edukacije | `learner-education-loading` test id + stable shell waits |

## Recommendation for future regressions

Run `ops:learner-final-acceptance-1` **sequentially**, not in parallel with `ops:admin-gov-final-acceptance-1` or other Playwright-heavy ops bundles, to avoid browser contention on shared local frontend.
