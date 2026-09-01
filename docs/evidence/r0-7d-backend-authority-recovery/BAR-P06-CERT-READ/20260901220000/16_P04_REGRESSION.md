# P04 Regression

BAR_P04_REQUIRED_BEHAVIOR_PASS_COUNT=47
BAR_P04_REQUIRED_BEHAVIOR_FAIL_COUNT=0
P04_TEST_ID_UNIQUE_VALUE_COUNT=48
P04_DUPLICATE_TEST_ID_COUNT=0
P04_MISSING_TEST_ID_COUNT=0

VALIDATION_CMD_12=corepack pnpm@9.14.2 --filter @confora/api exec jest --runInBand --config jest.config.cjs src/tenant/tenant-context.store.spec.ts src/tenant/client-tenant-rejection.middleware.spec.ts src/tenant/active-assurance.guard.spec.ts src/prisma/tenant-prisma.service.spec.ts src/prisma/tenant-model-policy.spec.ts src/prisma/raw-prisma-allowlist.spec.ts src/auth/mfa-assurance.guard.spec.ts
VALIDATION_CMD_12_RESULT=47 passed

VALIDATION_CMD_13=corepack pnpm@9.14.2 --filter @confora/shared-types exec tsx --test src/auth.mfa.spec.ts
VALIDATION_CMD_13_RESULT=8 passed

VALIDATION_CMD_14=corepack pnpm@9.14.2 --filter @confora/api exec jest --runInBand --config jest-e2e.config.cjs test/auth-bar-p04.e2e-spec.ts
VALIDATION_CMD_14_RESULT=6 passed

P06_TEST_075=PASS
P06_SEC_31=PASS
