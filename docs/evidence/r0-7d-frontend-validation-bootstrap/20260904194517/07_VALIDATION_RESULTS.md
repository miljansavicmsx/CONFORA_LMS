# 07_VALIDATION_RESULTS

## Required PASS commands (6)

| ID     | Purpose                                                                                     | Result |
| ------ | ------------------------------------------------------------------------------------------- | ------ |
| VB-V01 | Lockfile-faithful install; frontend `npm install --package-lock=false`; package-lock absent | PASS   |
| VB-V02 | Vite `loadConfigFromFile` loads; `confora-csp-preview` present                              | PASS   |
| VB-V03 | Two dedicated bootstrap test files PASS                                                     | PASS   |
| VB-V04 | Default Vitest config/setup load + representative execution via bootstrap tests             | PASS   |
| VB-V05 | Exact six non-evidence paths vs base                                                        | PASS   |
| VB-V06 | Dependency/manifest/lock/.npmrc/backend/T026/unrelated delta = 0                            | PASS   |

Counts:

- `REQUIRED_PASS_COMMAND_COUNT` = 6
- `REQUIRED_PASS_COMMAND_EXECUTED_COUNT` = 6
- `REQUIRED_PASS_COMMAND_PASS_COUNT` = 6
- `REQUIRED_PASS_COMMAND_FAIL_COUNT` = 0

## Expected baseline diagnostic (1)

| ID     | Purpose                                             | Result class                           |
| ------ | --------------------------------------------------- | -------------------------------------- |
| VB-V07 | Feature `npm run lint:all` vs clean-base signatures | EXPECTED_BASELINE_DIAGNOSTIC (matched) |

Counts:

- `EXPECTED_BASELINE_DIAGNOSTIC_COMMAND_COUNT` = 1
- `EXPECTED_BASELINE_DIAGNOSTIC_EXECUTED_COUNT` = 1
- `EXPECTED_BASELINE_DIAGNOSTIC_MATCH_COUNT` = 1

Do **not** interpret this section as 7/7 PASS.
