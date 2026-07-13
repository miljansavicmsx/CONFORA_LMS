# STAFF-MFA-3 Discovery

## Prior evidence

| Phase | Folder |
|-------|--------|
| STAFF-MFA-1 | `docs/evidence/f5-pilot-readiness/2026-07-05T13-40-00-staff-mfa-1/` |
| STAFF-MFA-2 | `docs/evidence/f5-pilot-readiness/2026-07-05T20-26-14-staff-mfa-2-pre-external-cutover/` |

## Current Keycloak realm MFA state

| Item | Status |
|------|--------|
| Realm | `confora` |
| Browser flow | browser |
| OTP policy | TOTP 6 digits / 30s |
| Conditional OTP executions | 5 |
| `mfa_verified` claim mapper | Present |

## Enforcement point (current)

| Layer | Mechanism |
|-------|-----------|
| **Backend** | `MfaGuard` (global) denies staff in `MFA_MANDATORY_ROLES` when `deriveMfaVerified(payload)` is false |
| **Canonical MFA signal** | `amr` includes `otp`/`totp`/`mfa` **OR** JWT `mfa_verified=true` |
| **Local smoke bypass** | Keycloak user attribute `pilot_smoke_mfa_verified=true` → `mfa_verified` claim (LOCAL_ONLY) |
| **Frontend** | Displays MFA state from `/auth/me`; does not bypass backend guard |
| **Ops gate** | This closure script proves denial/acceptance matrix |

## Gaps

| Gap | Impact |
|-----|--------|
| Real TOTP on production-facing staff accounts | Manual enrollment required before external pilot |
| Security delegate sign-off | Technical gate can close; human approval still pending |
| DPO/legal review | Out of scope — not claimed |

## Safe for local pilot vs external pilot

| Mode | Staff without real OTP | Staff with smoke bypass attribute |
|------|------------------------|-----------------------------------|
| Local pilot smoke | Allowed via `pilot_smoke_mfa_verified` | Explicit, auditable |
| External pilot candidate | **Denied (403)** on staff routes | Attribute must be absent |

Probe error: none
