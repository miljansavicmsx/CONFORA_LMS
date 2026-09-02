# P05 Regression

R2_F27_STATUS=CLOSED_VERIFIED
R2_MINOR_NON_CAS_ADVANCE_CHAIN_HEAD_STATUS=CLOSED_VERIFIED
RUN_SERIALIZABLE_WITH_API_PUBLICLY_REACHABLE=false
AUDIT_SERVICE_PUBLIC_OPERATION_SET=append|executeInTransaction
RAW_PRISMA_ALLOWED_PRODUCTION_PATH_COUNT=7
P05_PRODUCTION_EVENT_COUNT=0
P05_AUDIT_REGISTRY_DELTA_COUNT=0
P05_AUDIT_APPEND_BY_BAR_P06_COUNT=0
P05_SCHEMA_SEMANTIC_REGRESSION_COUNT=0

VALIDATION_CMD_15=corepack pnpm@9.14.2 --filter @confora/api exec jest --runInBand --config jest.config.cjs src/audit/audit-boundary.spec.ts src/audit/audit-event.registry.spec.ts src/audit/audit-canonicalizer.spec.ts src/audit/audit-hash.service.spec.ts src/audit/audit-integrity.service.spec.ts src/audit/audit-validators.spec.ts src/audit/audit.service.spec.ts
VALIDATION_CMD_15_RESULT=37 passed

VALIDATION_CMD_16_FROZEN=corepack pnpm@9.14.2 --filter @confora/api exec jest --runInBand --config jest.integration.config.cjs test/audit-bar-p05.integration.e2e-spec.ts
VALIDATION_CMD_16_FROZEN_RESULT=FAIL exit 1 No tests found

VALIDATION_CMD_16_ACTUAL=corepack pnpm@9.14.2 --filter @confora/api exec jest --runInBand --config jest-e2e.config.cjs test/audit-bar-p05.integration.e2e-spec.ts
VALIDATION_CMD_16_ACTUAL_RESULT=15 passed

P06_TEST_076=PASS
