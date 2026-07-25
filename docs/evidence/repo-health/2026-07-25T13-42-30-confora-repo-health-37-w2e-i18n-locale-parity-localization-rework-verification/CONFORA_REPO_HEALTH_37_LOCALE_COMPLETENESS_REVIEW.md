# CONFORA-REPO-HEALTH-37 — Locale Completeness Review

## JSON validity

All 14 modified locale JSON files parse successfully (`ConvertFrom-Json`).

## Package parity tests

```text
pnpm exec jest --config packages/i18n/jest.config.cjs
Tests: 128 passed, 128 total
JEST_EXIT=0
```

Includes:

- a11y canonical keys for all 5 locales
- namespace key parity vs EN for auth, shell, candidatePortal, certificationStaff, **navigation**, dashboard, common

Navigation parity (the RH36 failure set) now **PASS** for bs/sr/hr/sl.

`locale_completeness_pass: true`
