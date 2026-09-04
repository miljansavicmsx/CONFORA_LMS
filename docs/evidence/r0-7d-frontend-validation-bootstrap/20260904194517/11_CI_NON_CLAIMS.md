# 11_CI_NON_CLAIMS

## Preserved formal CI debt

- `PRE_EXISTING_CI_DEBT` = OPEN
- `OPEN_PRE_EXISTING_CI_DEBT_COUNT` = 4
- `CI_SEED_EXPECTATION_DEBT` = OPEN
- `CI_FAILURE_WAIVER_GRANTED` = false
- `CI_GREEN_CLAIMED` = false

## Frontend TypeScript baseline

- Global frontend `npm run lint:all` remains FAIL after bootstrap.
- Baseline diagnostic count remains 178 (with authorized TS2307→TS7016 transition on `vite.config.ts` only).
- This 178-diagnostic condition is **not** automatically merged into the formal count of four CI debt classes without separate governance authority.

## Non-claims

This bootstrap package does not claim:

- CI green
- global frontend TypeScript remediation
- waiver of CI failures
- closure of pre-existing CI debt classes
