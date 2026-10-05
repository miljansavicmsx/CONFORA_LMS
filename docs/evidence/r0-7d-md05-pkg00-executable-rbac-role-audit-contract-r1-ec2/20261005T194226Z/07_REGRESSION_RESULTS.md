# 07 — Regression results

Commands were run in the authoring session. Dependencies were not installed or upgraded. Lockfiles were not modified.

```text
pnpm --dir packages/shared-types exec tsx --test src/health.test.ts src/auth.mfa.spec.ts src/md05-pkg00-rbac-role-audit.spec.ts
RESULT = PASS
TESTS = 52
FAIL = 0
```

That command includes the PKG-00 shared-types tests, the EC1 negative tests in `md05-pkg00-rbac-role-audit.spec.ts` (EC1-T01 through EC1-T22 and EC1-T35), the MFA shared-types tests, and the shared-types health test.

```text
pnpm --dir apps/api exec jest --runInBand src/audit src/auth/mfa-assurance.guard.spec.ts --no-coverage
RESULT = PASS
TEST_SUITES = 10
TESTS = 97
FAIL = 0
```

The audit suites are `audit-boundary`, `audit-canonicalizer`, `audit-integrity.service`, `audit-hash.service`, `md05-pkg00-production-append`, `md05-pkg00-role-audit-contract`, `audit-validators`, `audit.service`, and `audit-event.registry`. The role-audit contract suite contains the EC1 API negative tests, including EC1-T23 through EC1-T34 and EC1-T36. The MFA guard suite is `mfa-assurance.guard.spec.ts`.

```text
pnpm --dir packages/shared-types typecheck
RESULT = PASS
pnpm --dir packages/shared-types build
RESULT = PASS
pnpm --dir apps/api typecheck
RESULT = PASS
pnpm --dir apps/api build
RESULT = PASS
```

`git diff --check 939472decb2002045d5f20bc3c894e7f34919afe` on the implementation diff, before evidence transcription, returned no findings. The full working-tree check against that commit and against `fdc42d3740eba24311fe3f4726be1d13db6356ce` is recorded in `10_VALIDATION.md` after the evidence files were formatted.
