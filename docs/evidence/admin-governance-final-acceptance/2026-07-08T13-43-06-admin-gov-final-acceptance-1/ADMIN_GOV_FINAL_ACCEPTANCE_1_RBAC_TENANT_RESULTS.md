# ADMIN-GOV-FINAL-ACCEPTANCE-1 RBAC / Tenant Results

| Probe | Expected | Result |
|-------|----------|--------|
| Learner → staff reports | 403 | 403 |
| Manager → staff reports | 200 | 200 |
| Learner → identity queue | 403 | N/A |
| no-tenant login | deny | FAIL (token issued) |
| wrong-tenant login | isolated | LOGIN_OK |
| Playwright route denials | redirect/deny | PASS |

Overall: **PARTIAL**
