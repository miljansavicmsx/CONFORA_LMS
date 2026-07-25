# CONFORA-REPO-HEALTH-36 — Validation Commands

## Typecheck

```text
pnpm exec tsc --noEmit -p packages/i18n/tsconfig.json
TSC_EXIT=0
```

`typecheck_passed: true`

## Tests (jest)

```text
cd packages/i18n
pnpm exec jest --config jest.config.cjs
JEST_EXIT=1
```

Result: **3 failed, 125 passed, 128 total** (Test Suites: 1 failed).

### Failing assertions (genuine data drift, not tooling)

```text
namespace locale parity (en canonical)
  × navigation.bs matches en key set
  × navigation.sr matches en key set
  × navigation.sl matches en key set
    + "items.appealsComplaints"   ← extra key not in en
```

Honest classification (per constraint 24): the test harness ran correctly; failures are **real locale parity drift** in the tracked data. Not fixed in this task (audit-only).

`tests_passed: false`

## Notes

- No dependencies installed (`pnpm exec` used existing toolchain).
- No source modified. No fixes applied.
