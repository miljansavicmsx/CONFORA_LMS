# STAFF-MFA-2 MfaGuard Verification

| Check | Result |
|-------|--------|
| MfaGuard active (APP_GUARD) | Yes — unchanged |
| Privileged route without `mfa_verified` | **403 Forbidden** — `pilot.staff.mfa.external@confora.test` at `/v1/staff/reports/overview` |
| Privileged route with smoke bypass | **200 OK** — `pilot.staff@confora.test` |
| Learner login | **OK** — `pilot.learner@confora.test` |
| Public verify | **200** — no auth required |
| Auth bypass introduced | **No** |
| MfaGuard weakened | **No** |
| RBAC unchanged | **Yes** |
| Tenant isolation unchanged | **Yes** |

## Probe summary

External user JWT: `mfa_verified=false`, empty `amr` — MfaGuard correctly denies staff route.

Smoke staff JWT: `mfa_verified=true` via `pilot_smoke_mfa_verified` attribute (LOCAL_ONLY).

See `mfa-proof/mfaguard-probes.json`. No tokens, passwords, or OTP secrets stored.
