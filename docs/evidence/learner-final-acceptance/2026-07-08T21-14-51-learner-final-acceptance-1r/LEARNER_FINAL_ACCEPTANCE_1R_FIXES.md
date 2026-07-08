# LEARNER_FINAL_ACCEPTANCE_1R Fixes

| Blocker | Root cause | Fix |
|---------|------------|-----|
| Katalog strict mode | `.or()` matched both `public-catalog-page` and `catalog-course-list` | Wait for page shell, then list/empty state separately |
| RBAC negative | `waitForURL` regex rejected `/unauthorized` | `expectStaffRouteDenied` accepts safe denial routes |
| Moje edukacije flake | Page shell wait too narrow under load | Heading + loading/enrolment list stable waits; `learner-education-loading` test id |
