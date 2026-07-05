# S17 Public Verification Browser Results

| Check | Status | Detail |
|-------|--------|--------|
| Frontend :3001 | PASS | Vite dev server reachable |
| Public `/verify` no auth | PASS | HTTP 200 without session |
| API health | PASS | `GET http://localhost:4000/health` → 200 |
| Valid lookup (API) | PASS | hash `cedf36de04cb8d9866451349199e9861a4641c31bb48ea78c65cdf1eae6a7945` → `valid=true`, `lifecycleStatus=VALID` |
| Invalid lookup (API) | PASS | 64×`0` → `validityState=NOT_FOUND`, no private keys |
| Playwright `public-ux-1.spec.ts` | PASS | 5 passed, 1 skipped (no published course detail), 0 failed |
| Playwright `s17-public-verify-browser.spec.ts` | PASS | 3/3 passed |
| Read-only network probe | PASS | No non-GET mutation calls on valid verify walkthrough |
| ops:public-ux-1r3 | TIER1_PASS | Tier 1 gates PASS incl. Playwright; Tier 2 smokes FAIL (pnpm spawn — not S17 regression) |
| ops:cert-ops-1r | SKIPPED | Optional; not required for S17 browser sign-off |

## Live fixture

| Field | Value |
|-------|-------|
| Certificate number | CON-2026-000015 |
| Status | ACTIVE / VALID |
| Holder (public label) | Pilot Learner2 |
| Scheme | Sample certification scheme |

## Startup fix applied (browser unblock)

Missing export `resolveEffectiveCertRegistrySourceMode` in `api-certificates.ts` caused blank React shell (module load failure via eager `IsoStaticPages` import). Restored export + minimal public verify test hooks on `VerifyLookupPage`. No certification logic, schema, or RBAC changes.

## Regression guard

| Command | Status |
|---------|--------|
| `audit:f4-frontend-api` | PASS |
| `ops:f5-3-data-readiness` | PASS (50/50) |
| `ops:f5-5-security-gdpr-audit` | PASS (18/18 checks) |
| `ops:f4-9-smoke-test` | PASS (10/10) |

Linked `ops:public-ux-1r3` tier-1 evidence: `docs/evidence/public-ux-live/2026-07-05T09-23-44-public-ux-1r3/`
