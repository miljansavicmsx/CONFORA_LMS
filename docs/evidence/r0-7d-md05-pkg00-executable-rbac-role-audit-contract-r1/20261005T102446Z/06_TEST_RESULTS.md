# 06 — Test results

Commands used real production modules. No production shim was introduced.

```text
TARGETED_TEST_RESULT = PASS
SHARED_TYPES_TEST_RESULT = PASS
AUDIT_TEST_RESULT = PASS
TYPECHECK_RESULT = PASS
```

## @confora/shared-types

`pnpm --dir packages/shared-types test`

`tsx --test src/health.test.ts` — 1 passed, 0 failed.

`pnpm --dir packages/shared-types exec tsx --test src/auth.mfa.spec.ts src/md05-pkg00-rbac-role-audit.spec.ts`

28 passed, 0 failed. Covers T01–T18, T22, the historical MFA tests, and the STAFF_ROLEADM self-management prohibition.

`pnpm --dir packages/shared-types exec tsc --noEmit -p tsconfig.json` — PASS.

Post-format re-run of `src/md05-pkg00-rbac-role-audit.spec.ts` — 20 passed, 0 failed.

## @confora/api

`pnpm --dir apps/api exec tsc --noEmit -p tsconfig.build.json` — PASS after building existing `@confora/shared-types` and `@confora/database` outputs. Those builds did not change the lockfile or schema.

`pnpm --dir apps/api exec jest --runInBand src/audit/audit-event.registry.spec.ts src/audit/md05-pkg00-role-audit-contract.spec.ts src/audit/audit-validators.spec.ts src/auth/mfa-assurance.guard.spec.ts`

4 suites passed, 22 tests passed, 0 failed. Covers T19–T21, T23, the existing registry and validator tests, and privileged MFA enforcement.

`git diff --check` — PASS.
