# TD-070-F1 Regression Results

## Sequential local pilot regression

```bash
npm run ops:local-pilot-sequential-regression
```

| Field | Value |
|-------|-------|
| **Evidence** | `docs/evidence/td-085-sequential-regression/2026-07-11T10-15-33-td-085/` |
| **Result** | **PASS 6/6** |
| **Duration** | 555s |
| **Verdict** | `TD_085_GO_LOCAL_BASELINE_CONFIRMED` |

| Step | Status |
|------|--------|
| audit:f4-frontend-api | PASS |
| ops:f5-3-data-readiness | PASS |
| ops:s17-public-verify-browser | PASS |
| ops:admin-gov-final-acceptance-1 | PASS |
| ops:learner-final-acceptance-1 | PASS |
| ops:f4-9-smoke | PASS |

## Targeted i18n tests

| Suite | Status |
|-------|--------|
| `packages/i18n` Jest | PASS 66/66 |
| Frontend vitest (locale + switcher + selector) | PASS 9/9 |

## Skipped

None.

## Governance guard

| Flag | Value |
|------|-------|
| rbac_weakened | false |
| tenant_isolation_weakened | false |
| privacy_weakened | false |
| governance_boundaries_weakened | false |
| prisma_schema_changed | false |
| migrations_changed | false |
