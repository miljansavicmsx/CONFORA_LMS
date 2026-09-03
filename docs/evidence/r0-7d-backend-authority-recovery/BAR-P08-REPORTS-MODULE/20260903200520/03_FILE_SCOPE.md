# File Scope

P08_NON_EVIDENCE_PATH_COUNT=15
P08_PRODUCTION_SOURCE_PATH_COUNT=6
P08_NEW_TEST_PATH_COUNT=6
P08_P07_ADAPTATION_PATH_COUNT=2
P08_P03_AUTH30_ADAPTATION_PATH_COUNT=1
P08_REGRESSION_ADAPTATION_PATH_COUNT=3
PATH_16_COUNT=0
OUTSIDE_FROZEN_SCOPE_PATH_COUNT=0

## Exact 15 non-evidence paths

### Production source (6)

1. apps/api/src/reports/reports.module.ts
2. apps/api/src/reports/reports.controller.ts
3. apps/api/src/reports/dto/report-aggregate-query.dto.ts
4. apps/api/src/reports/reports-roles.guard.ts
5. apps/api/src/reports/report-query-contract.filter.ts
6. apps/api/src/app.module.ts

### New P08 tests (6)

7. apps/api/src/reports/reports.controller.spec.ts
8. apps/api/src/reports/reports-roles.guard.spec.ts
9. apps/api/src/reports/dto/report-aggregate-query.dto.spec.ts
10. apps/api/src/reports/report-query-contract.filter.spec.ts
11. apps/api/src/reports/reports-boundary.spec.ts
12. apps/api/test/reports-bar-p08.e2e-spec.ts

### P07 forward-compatibility adaptations (2)

13. apps/api/src/report-query/report-query-boundary.spec.ts
14. apps/api/test/report-query-bar-p07.e2e-spec.ts

### P03 AUTH_30 forward-compatibility adaptation (1)

15. apps/api/test/auth-bar-p03.e2e-spec.ts
