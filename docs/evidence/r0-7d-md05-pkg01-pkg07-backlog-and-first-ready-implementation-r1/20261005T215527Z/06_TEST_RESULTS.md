# 06 — Test results

PKG-00 post-merge smoke, after `pnpm --dir packages/database exec prisma generate` because the generated client was absent in this environment:

```text
pnpm --dir packages/shared-types exec tsx --test src/health.test.ts src/auth.mfa.spec.ts src/md05-pkg00-rbac-role-audit.spec.ts
RESULT = PASS
TESTS = 52
FAIL = 0

pnpm --dir apps/api exec jest --runInBand src/audit src/auth/mfa-assurance.guard.spec.ts --no-coverage
RESULT = PASS
TEST_SUITES = 10
TESTS = 97
FAIL = 0

pnpm --dir packages/shared-types typecheck
RESULT = PASS
pnpm --dir packages/shared-types build
RESULT = PASS
pnpm --dir apps/api typecheck
RESULT = PASS
pnpm --dir apps/api build
RESULT = PASS
git diff --check
RESULT = PASS
git diff --check fdc42d3740eba24311fe3f4726be1d13db6356ce HEAD
RESULT = PASS at smoke time
```

The first API audit run, before Prisma client generation, failed `P05_TEST_048` and `P05_TEST_049` with `AUDIT_APPEND_FAILED`. The same tests passed after client generation. That was an environment precondition, not a source regression. `STOP_CODE = PKG00_POSTMERGE_REGRESSION` was not raised.

PKG-01 and regression after implementation:

```text
pnpm --dir apps/api exec eslint src/role-administration src/app.module.ts --max-warnings 0
RESULT = PASS

pnpm --dir apps/api exec jest --runInBand src/role-administration/role-administration-boundary.service.spec.ts src/audit src/auth/mfa-assurance.guard.spec.ts --no-coverage
RESULT = PASS
TEST_SUITES = 11
TESTS = 112
FAIL = 0

pnpm --dir packages/shared-types exec tsx --test src/health.test.ts src/auth.mfa.spec.ts src/md05-pkg00-rbac-role-audit.spec.ts
RESULT = PASS
TESTS = 52
FAIL = 0

pnpm --dir packages/shared-types typecheck
RESULT = PASS
pnpm --dir apps/api typecheck
RESULT = PASS
pnpm --dir apps/api build
RESULT = PASS
```

Focused PKG-01 file after prettier: 15 passed, 0 failed.

Frontend typecheck was not run. Frontend files were not changed.
