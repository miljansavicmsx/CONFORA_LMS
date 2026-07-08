# ADMIN-GOV-FINAL-ACCEPTANCE-1 RBAC / Tenant Results

| Probe | Expected | Result |
|-------|----------|--------|
| Learner → staff reports | 403 | N/A |
| Manager → staff reports | 200 | N/A |
| Learner → identity queue | 403 | N/A |
| no-tenant login | deny | PASS (denied) |
| wrong-tenant login | isolated | FAIL |
| Playwright route denials | redirect/deny | SKIPPED_STACK_DOWN |

Overall: **BLOCKED**
