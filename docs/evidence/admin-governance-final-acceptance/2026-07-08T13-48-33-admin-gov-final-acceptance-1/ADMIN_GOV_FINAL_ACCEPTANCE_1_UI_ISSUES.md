# ADMIN-GOV-FINAL-ACCEPTANCE-1 UI Issues

| # | Severity | Area | Note |
|---|----------|------|------|
| 1 | MINOR | identity-review-api | GET /v1/staff/identity-review/queue returns 404 for staff and learner (module not mounted in running Nest); frontend IdentityReviewGuard still denies learners — no data leakage |

Raw enum scan: PASS
Language consistency: PASS
Console errors: NONE_OBSERVED
