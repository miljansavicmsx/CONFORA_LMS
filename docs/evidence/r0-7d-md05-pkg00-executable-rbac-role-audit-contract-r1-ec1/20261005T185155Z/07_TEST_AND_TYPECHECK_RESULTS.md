# 07 — Test and typecheck results

Dependencies were installed with `pnpm install --frozen-lockfile` because this workspace had no `node_modules`. The lockfile was already up to date and was not modified. No dependency was upgraded.

```text
SHARED_TYPES_PKG00_AND_MFA_RESULT = PASS
SHARED_TYPES_HEALTH_RESULT = PASS
API_AUDIT_AND_MFA_RESULT = PASS
API_AUDIT_VALIDATOR_REGRESSION_RESULT = PASS
SHARED_TYPES_TYPECHECK_RESULT = PASS
SHARED_TYPES_BUILD_RESULT = PASS
API_TYPECHECK_RESULT = PASS
DIFF_CHECK_RESULT = PASS
```

## Commands

`pnpm --dir packages/shared-types exec tsx --test src/auth.mfa.spec.ts src/md05-pkg00-rbac-role-audit.spec.ts`

51 passed, 0 failed. This includes the historical PKG-00 tests, the MFA tests, and EC1-T01 through EC1-T22 plus EC1-T35.

`pnpm --dir packages/shared-types test`

1 passed, 0 failed (`health.test.ts`).

`pnpm --dir apps/api exec jest --runInBand src/audit/audit-event.registry.spec.ts src/audit/md05-pkg00-role-audit-contract.spec.ts src/auth/mfa-assurance.guard.spec.ts`

3 suites passed, 28 tests passed, 0 failed. This includes the registry tests, the PKG-00 audit-contract tests, the MFA guard tests, and EC1-T23 through EC1-T34 plus EC1-T36.

`pnpm --dir apps/api exec jest --runInBand src/audit/audit-validators.spec.ts`

1 suite passed, 7 tests passed, 0 failed. `audit-validators.ts` was not modified. This run confirms the generic allowlist helper still passes.

`pnpm --dir packages/shared-types exec tsc --noEmit -p tsconfig.json` — PASS.

`pnpm --dir packages/shared-types build` — PASS.

`pnpm --dir packages/database build` — PASS. Required so API typecheck can resolve the existing `@confora/database` output. No schema, migration, or lockfile change.

`pnpm --dir apps/api exec tsc --noEmit -p tsconfig.build.json` — PASS.

`git diff --check c32b423088c57b40635ef400e185392a5de350e3` — PASS.

`git diff --check fdc42d3740eba24311fe3f4726be1d13db6356ce` — PASS.
