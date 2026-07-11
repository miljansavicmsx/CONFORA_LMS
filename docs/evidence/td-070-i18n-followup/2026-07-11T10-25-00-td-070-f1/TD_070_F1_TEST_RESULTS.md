# TD-070-F1 Test Results

## i18n package (`packages/i18n`)

```bash
npm test
```

**Result:** PASS — 66/66

- a11y keys all locales including `sl`
- Namespace parity: auth, shell, candidatePortal, certificationStaff

```bash
npm run build
```

**Result:** PASS

## Frontend unit tests

```bash
pnpm exec vitest run \
  src/lib/__tests__/locale-preference.test.ts \
  src/components/i18n/__tests__/language-switcher.test.tsx \
  src/components/learner/__tests__/certificate-selector.test.tsx
```

**Result:** PASS — 9/9

| Test file | Tests |
|-----------|-------|
| locale-preference.test.ts | 3 |
| language-switcher.test.tsx | 2 |
| certificate-selector.test.tsx | 4 |

## Acceptance implications

| Check | Expected |
|-------|----------|
| raw_enum (admin-gov) | PASS — admin labels unchanged (Serbian maps) |
| learner acceptance | PASS — default `hr`; no RBAC change |
| admin-gov acceptance | PASS — education labels via `admin-gov-ux-labels` |

Verified via sequential regression (see TD_070_F1_REGRESSION_RESULTS.md).
