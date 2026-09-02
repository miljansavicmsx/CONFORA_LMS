# P03 Regression

BAR_P03_REGRESSION_TESTS=PASS
BAR_P03_UNIT_TEST_COUNT=24
BAR_P03_E2E_TEST_COUNT=6
P03_PRODUCTION_AUTH_SEMANTIC_CHANGE_COUNT=0
P03_IDENTITY_SEMANTIC_CHANGE_COUNT=0

VALIDATION_CMD_10=corepack pnpm@9.14.2 --filter @confora/api exec jest --runInBand --config jest.config.cjs src/auth/auth-config.spec.ts src/auth/jwt-auth.guard.spec.ts src/auth/jwt.strategy.spec.ts src/auth/resolve-db-user.spec.ts
VALIDATION_CMD_10_RESULT=24 passed

VALIDATION_CMD_11=corepack pnpm@9.14.2 --filter @confora/api exec jest --runInBand --config jest-e2e.config.cjs test/auth-bar-p03.e2e-spec.ts
VALIDATION_CMD_11_RESULT=6 passed

P06_TEST_074=PASS
P06_SEC_01=PASS
