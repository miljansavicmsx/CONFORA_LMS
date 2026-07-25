# CONFORA-REPO-HEALTH-38 — Validation Commands

## Typecheck

```text
pnpm exec tsc --noEmit -p packages/i18n/tsconfig.json
TSC_EXIT=0
```

`typecheck_passed: true`

## Tests

```text
cd packages/i18n
pnpm exec jest --config jest.config.cjs
```

```text
Test Suites: 1 passed, 1 total
Tests:       128 passed, 128 total
JEST_EXIT=0
```

`tests_passed: true` · `test_result: "128/128 PASS"`

## Notes

No dependency install. No source changes during closeout.
