# 10 — Validation

Shared-types production path change: none. The append boundary can see the actor tenant and can call `isRevokePostReviewDuePeriod` without altering the EC1 validator. That is recorded in `03_PRE_AND_POST_VALIDATION_FLOW.md`.

`audit-validators.ts` change: none. Generic allowlist behavior for non-PKG-00 events is unchanged, as exercised by `audit-validators.spec.ts`, `audit.service.spec.ts`, and EC2-T29.

Changed production path: `apps/api/src/audit/audit.service.ts`.
Added test path: `apps/api/src/audit/md05-pkg00-production-append.spec.ts`.
Added evidence path: this directory.
Earlier evidence directories were not modified.

```text
SHARED_TYPES_TESTS = PASS (52)
API_AUDIT_AND_MFA_TESTS = PASS (97)
SHARED_TYPES_TYPECHECK = PASS
SHARED_TYPES_BUILD = PASS
API_TYPECHECK = PASS
API_BUILD = PASS
LOCKFILE_MUTATED = false
DEPENDENCIES_INSTALLED_OR_UPGRADED = false
```

Whitespace checks, run after Prettier formatted this evidence directory:

```text
git diff --check 939472decb2002045d5f20bc3c894e7f34919afe = PASS
git diff --check fdc42d3740eba24311fe3f4726be1d13db6356ce = PASS
```
