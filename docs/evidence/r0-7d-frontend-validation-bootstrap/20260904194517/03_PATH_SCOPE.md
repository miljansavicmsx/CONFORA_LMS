# 03_PATH_SCOPE

## Non-evidence paths (exact 6)

### Source / tooling (4)

1. `frontend-app/vite-csp-preview.mjs`
2. `frontend-app/src/test/vitest-resize-observer.ts`
3. `frontend-app/src/test/vitest-axios-adapter.ts`
4. `frontend-app/src/test/vitest-fetch-guard.ts`

### Tests (2)

5. `frontend-app/src/test/__tests__/vite-csp-preview.bootstrap.test.ts`
6. `frontend-app/src/test/__tests__/vitest-setup.bootstrap.test.ts`

## Counts

- `BOOTSTRAP_SOURCE_PATH_COUNT` = 4
- `BOOTSTRAP_TEST_PATH_COUNT` = 2
- `BOOTSTRAP_NON_EVIDENCE_PATH_COUNT` = 6
- `BOOTSTRAP_OUTSIDE_NON_EVIDENCE_SCOPE_PATH_COUNT` = 0
- `BOOTSTRAP_T026_PRODUCT_PATH_COUNT` = 0
- `BOOTSTRAP_UNRELATED_FRONTEND_DEBT_REMEDIATION_PATH_COUNT` = 0
- `BOOTSTRAP_BACKEND_PRODUCTION_PATH_DELTA` = 0
- `BOOTSTRAP_MANIFEST_DELTA` = 0
- `BOOTSTRAP_LOCKFILE_DELTA` = 0
- `BOOTSTRAP_NPMRC_DELTA` = 0

## Explicitly unmodified

`vite.config.ts`, manifests, lockfiles, `.npmrc`, tsconfig\*, `build-csp.mjs`, CSP `.d.ts`, `lms-api-test-mock.ts`, `api-base-url.ts`, all T026 product/i18n/test paths, `apps/api/**`, `packages/database/**`, migrations.
