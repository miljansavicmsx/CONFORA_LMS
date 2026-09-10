# 07_TARGETED_TESTS

REQUIRED_TARGETED_TEST_COMMAND_COUNT = 3
REQUIRED_TARGETED_TEST_COMMANDS =

1. npm --prefix frontend-app exec vitest run src/test/**tests**/landmark-dev-audit.residual.test.ts
2. npm --prefix frontend-app exec vitest run src/test/**tests**/vite-csp-preview.bootstrap.test.ts
3. npm --prefix frontend-app exec vitest run src/test/**tests**/vitest-setup.bootstrap.test.ts

TARGETED_TEST_COMMAND_EXECUTED_COUNT = 3
TARGETED_TEST_FAILURE_COUNT = 0

RESULTS =

1. EXIT=0 TESTS=6/6 PASS
2. EXIT=0 TESTS=5/5 PASS
3. EXIT=0 TESTS=4/4 PASS

SOURCE_COMMIT_CLEAN_CLONE_VALIDATION = PASS
SOURCE_COMMIT_TARGETED_TEST_FAILURE_COUNT = 0
VERIFY_WORKTREE = C:\CONFORA_R0D_C3S10_RESIDUAL_CLOSURE_R1_VERIFY @ faf8ee7ef2dc50dd821981d198edf9f7291bc1eb

TEST_ASSERTION_WEAKENING_COUNT = 0
TAUTOLOGICAL_TEST_COUNT = 0
TEST_ONLY_FAKE_PASS_COUNT = 0
