# ADMIN-GOV-FINAL-ACCEPTANCE-1 RBAC / Tenant Results

| Probe | Expected | Result |
|-------|----------|--------|
| Learner → staff reports | 403 | 403 |
| Manager → staff reports | 200 | 200 |
| Learner → identity queue | non-2xx (no payload) | 404 (denied=true) |
| Identity queue API mounted | staff/director 200 | NO (404) |
| no-tenant /auth/me | deny (403) | PASS (403) |
| wrong-tenant login | isolated | LOGIN_OK |
| Playwright route denials | redirect/deny | PASS |

Overall: **PASS**
