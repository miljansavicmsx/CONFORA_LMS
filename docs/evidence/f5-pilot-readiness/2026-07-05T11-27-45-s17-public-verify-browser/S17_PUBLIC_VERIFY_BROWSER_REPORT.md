# S17 Public Verification Browser Sign-off Report

| Field | Value |
|-------|-------|
| **Evidence** | `docs/evidence/f5-pilot-readiness/2026-07-05T11-27-45-s17-public-verify-browser/` |
| **Task** | S17-PUBLIC-VERIFY-BROWSER-1 |
| **Context** | F5-7-RECHECK after CA-H01 (`F5_7_RECHECK_CA_H01_CLOSED_FULL_INTERNAL_CONDITIONAL_GO_EXTERNAL_NO_GO`) |
| **Verdict** | **S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED** |
| **Live verify hash** | `cedf36de04cb8d9866451349199e9861a4641c31bb48ea78c65cdf1eae6a7945` |

## Executive summary

Public certificate verification is confirmed working in a real browser without authentication. Valid and invalid lookups behave safely, the flow is read-only, and public responses minimize PII. A missing frontend export blocked the React shell at session start; restoring it was an environment/startup fix only — no certification business logic, schema, migration, RBAC, or tenant isolation changes.

## Preconditions verified

1. Nest API :4000 — health 200
2. Frontend :3001 — Vite dev with hybrid API → Nest
3. Live certificate fixture in `cert.certificates` (ACTIVE, verification hash above)

## Browser walkthrough

| Step | Result |
|------|--------|
| Incognito-equivalent (no login) `/verify` | PASS |
| Valid hash `/verify/{hash}` | PASS — status, scheme, cert number, public holder label |
| Invalid hash | PASS — safe not-found |
| Read-only | PASS — no mutation API calls |
| PII minimization | PASS — see privacy check artifact |
| Admin route denied | PASS — Playwright `public-ux-1` |

## Ops commands

| Command | Result |
|---------|--------|
| `npm run ops:public-ux-1r3` | Tier 1 **PASS** (stack, verify probe, unit, **Playwright**); Tier 2 smokes FAIL (orchestrator `pnpm` spawn — pre-existing soak policy, not S17 blocker). Evidence: `docs/evidence/public-ux-live/2026-07-05T09-23-44-public-ux-1r3/` |
| `npm run ops:cert-ops-1r` | SKIPPED (optional) |

## Regression guard

| Command | Status |
|---------|--------|
| `npm run audit:f4-frontend-api` | PASS |
| `npm run ops:f5-3-data-readiness` | PASS (50/50) |
| `npm run ops:f5-5-security-gdpr-audit` | PASS (18/18) |
| `npm run ops:f4-9-smoke-test` | PASS (10/10) |

## Production code note

| Item | Value |
|------|-------|
| `production_code_changed` | true (justified) |
| Scope | Missing `resolveEffectiveCertRegistrySourceMode` export restored; public verify page test hooks for sign-off |
| Prisma / migrations | unchanged |
| RBAC / tenant / governance | no weakening |

## F5 risk register — CA-M02 S17

**Recommend CLOSED** for browser sign-off scope. External pilot remains **NO-GO** due to Staff MFA (`AVAILABLE_NOT_ENFORCED`) and DPO/legal review (`PENDING`) — unchanged by this task.

No staging, production, external pilot, legal, or accreditation approval claimed.
