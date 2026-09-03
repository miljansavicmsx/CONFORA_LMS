# Build / Validation Commands

P08_VALIDATION_COMMAND_COUNT=24
P08_VALIDATION_COMMAND_EXECUTED_COUNT=24
P08_VALIDATION_COMMAND_PASS_COUNT=24
P08_VALIDATION_COMMAND_FAIL_COUNT=0
P08_VALIDATION_COMMAND_NOT_RUN_COUNT=0

All CMD01-CMD24 re-executed for R1 Retry 01 (historical R1 attempt 1 results not used as final proof).

| CMD                                  | Result |
| ------------------------------------ | ------ |
| CMD01 install --frozen-lockfile      | PASS   |
| CMD02 prisma generate                | PASS   |
| CMD03 prisma validate                | PASS   |
| CMD04 database build                 | PASS   |
| CMD05 database typecheck             | PASS   |
| CMD06 database test                  | PASS   |
| CMD07 shared-types build             | PASS   |
| CMD08 shared-kernel build            | PASS   |
| CMD09 api build                      | PASS   |
| CMD10 P08 unit specs                 | PASS   |
| CMD11 P08 e2e                        | PASS   |
| CMD12 auth unit                      | PASS   |
| CMD13 auth-bar-p03 e2e               | PASS   |
| CMD14 tenant/prisma/mfa unit         | PASS   |
| CMD15 shared-types auth.mfa          | PASS   |
| CMD16 auth-bar-p04 e2e               | PASS   |
| CMD17 audit unit                     | PASS   |
| CMD18 audit-bar-p05 e2e              | PASS   |
| CMD19 cert-app unit                  | PASS   |
| CMD20 cert-app-bar-p06 e2e           | PASS   |
| CMD21 report-query unit              | PASS   |
| CMD22 report-query-bar-p07 e2e       | PASS   |
| CMD23 selected schema invariants (8) | PASS   |
| CMD24 P07 schema zero-delta suite    | PASS   |

CMD13_RESULT=PASS
AUTH_30_RESULT=PASS
CMD23_SELECTED_TEST_COUNT=8
CMD23_SELECTED_TEST_SET_EXACT=true
