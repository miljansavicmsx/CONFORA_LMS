# BAR-P03 Regression

BAR_P03_PRODUCTION_AUTH_SOURCE_CHANGE_COUNT=0
BAR_P03_REGRESSION_TESTS=PASS
BAR_P03_E2E_TESTS=PASS
COMMANDS=

- corepack pnpm@9.14.2 --filter @confora/api exec jest --runInBand --config jest.config.cjs src/auth/auth-config.spec.ts src/auth/jwt-auth.guard.spec.ts src/auth/jwt.strategy.spec.ts src/auth/resolve-db-user.spec.ts
- corepack pnpm@9.14.2 --filter @confora/api exec jest --runInBand --config jest-e2e.config.cjs test/auth-bar-p03.e2e-spec.ts
