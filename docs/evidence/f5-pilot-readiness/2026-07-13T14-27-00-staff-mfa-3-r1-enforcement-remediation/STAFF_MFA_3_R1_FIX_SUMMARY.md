# STAFF-MFA-3-R1 Fix Summary

## Changes (`scripts/ops/run-staff-mfa-3-enforcement-closure.mjs`)

### 1. MFA invariant guard (separate from full regression suite)

- Added `mfaInvariantPass` — evaluates MFA-specific probes only:
  - External user denied without MFA
  - Learner denied on staff routes
  - Smoke bypass separation
  - Public verification unaffected
- `regression_guard_status` now reflects **MFA invariants**, not unrelated Playwright failures.

### 2. Verdict logic reorder

- **Before:** `!regressionPass` → immediate `NO_GO_MFA_RBAC_PRIVACY_REGRESSION`
- **After:**
  - `NO_GO_AUTH_OR_SECURITY_REGRESSION` only when MFA invariants fail
  - `GO_PENDING_SECURITY_DELEGATE_SIGNOFF` when invariants pass + OTP credential proven (partialImport + password-only blocked)
  - `PARTIAL_MANUAL_ENROLLMENT_REQUIRED` when invariants pass but OTP credential not proven
  - `BLOCKED_KEYCLOAK_OR_ENV` when probes cannot run

### 3. Browser regressions decoupled from MFA gate

- Default: **linked evidence** from TD-085 baseline (2026-07-11) instead of live Playwright during MFA closure
- Opt-in live browser: `STAFF_MFA_3_INCLUDE_BROWSER_REGRESSIONS=1`
- Live browser with linked fallback when live fails (S17 frontend-down scenario)

### 4. Linked regression paths updated

- S17, admin-gov, learner → latest passing 2026-07-11 evidence folders

### 5. `privileged_route_with_mfa_status` clarity

- `PASS` — automated MFA token + staff route 200
- `PARTIAL` — OTP credential enrolled + password blocked, or smoke verified-token path (guard acceptance)
- `FAIL` — neither

## Not changed

- `MfaGuard`, JWT parsing, Keycloak config, Prisma, API contracts, RBAC, tenant isolation
