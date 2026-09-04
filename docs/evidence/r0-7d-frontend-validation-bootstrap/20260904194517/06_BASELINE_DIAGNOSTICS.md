# 06_BASELINE_DIAGNOSTICS

## Command

- Working directory: `frontend-app`
- Command: `npm run lint:all` (`tsc -b --pretty false`)
- Class: `EXPECTED_BASELINE_DIAGNOSTIC` (nonzero exit expected)
- VB-V07 is **not** a PASS command and is not summarized as PASS.

## Signature method

`path|TScode|normalizedMessage` (whitespace collapsed; line number not sole identity)

## Clean-base (pre-implementation)

- `BASELINE_TS_DIAGNOSTIC_COUNT` = 178
- `BASELINE_TS_AFFECTED_PATH_COUNT` = 61
- Unique signature count observed = 146
- Included: `vite.config.ts|TS2307|Cannot find module './vite-csp-preview.mjs' or its corresponding type declarations.`

## Feature (post-implementation)

- `FEATURE_TS_DIAGNOSTIC_COUNT` = 178
- `FEATURE_TS_AFFECTED_PATH_COUNT` = 61
- Unique signature count observed = 146
- Global lint status: FAIL
- `BOOTSTRAP_MAKES_GLOBAL_LINT_GREEN` = false

## Authorized transition (exactly 1)

- Path: `frontend-app/vite.config.ts` (reported as `vite.config.ts` by `tsc -b`)
- Import target: `./vite-csp-preview.mjs`
- Baseline class: `TS2307_MISSING_MODULE`
- Feature class: `TS7016_MISSING_DECLARATION`
- `BOOTSTRAP_AUTHORIZED_DIAGNOSTIC_TRANSITION_COUNT` = 1

## After excluding only that transition

- `BOOTSTRAP_UNAUTHORIZED_NEW_TS_DIAGNOSTIC_COUNT` = 0
- `BOOTSTRAP_UNAUTHORIZED_CHANGED_SIGNATURE_TS_DIAGNOSTIC_COUNT` = 0
- `BOOTSTRAP_UNCLASSIFIED_TS_DIAGNOSTIC_COUNT` = 0
- `BOOTSTRAP_RESOLVED_PREEXISTING_TS_DIAGNOSTIC_COUNT` = 0

No CSP `.d.ts` was added.
