# Source Envelope

P07_AUTHORIZED_PRODUCTION_SOURCE_PATH_COUNT=8
P07_AUTHORIZED_TEST_PATH_COUNT=7
ACTUAL_PRODUCTION_SOURCE_CHANGED_PATH_COUNT=8
ACTUAL_TEST_CHANGED_PATH_COUNT=7

## Production (8)

1-6 report-query module/service/role/input/result/errors
7 tenant-prisma.service.ts
8 app.module.ts

## Tests (7)

9-11 report-query specs
12 tenant-prisma.service.spec.ts (P06_TEST_063 adaptation)
13 tenant-prisma-certification-application-p07.spec.ts
14 report-query-bar-p07.e2e-spec.ts
15 bar-p07-schema-zero-delta-invariants.test.ts
