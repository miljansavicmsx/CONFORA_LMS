# TD-082 Discovery — Certificant Seed for CPD Selector

| Field | Value |
|-------|-------|
| Task | TD-082 |
| Timestamp | 2026-07-09T12:37:37+02:00 |
| Prerequisite | TD-081 (`GET /v1/me/certificates` selector fields + UI) |

## Findings

### Seed infrastructure

| Layer | Script | Certificates? |
|-------|--------|---------------|
| Prisma base | `packages/database/prisma/seed.ts` | No — scheme + E2E draft app only |
| Pilot users | `scripts/ops/seed-pilot-auth-users.ts` | No — users + `user_roles` |
| Keycloak | `scripts/ops/keycloak-setup-pilot.mjs` | N/A — JWT realm roles |
| Legacy Dynamo | `scripts/seed_pilot_demo.py` | Yes — **not** Nest/Prisma wallet |
| B11-4 smoke | `run-b11-4-certificate-issuance-smoke.mjs` | Ephemeral via API — not durable seed |

### Target user

No literal `cand1` user. Pilot mapping:

| Email | ID | Role |
|-------|-----|------|
| `pilot.learner@confora.test` | `b2000000-0000-4000-8000-000000000001` | `USR_CAND` |
| `pilot.learner2@confora.test` | `b2000000-0000-4000-8000-000000000002` | `USR_CERT` |

**TD-082 uses `pilot.learner2@confora.test`** — already certificant in pilot auth seed.

### TD-081 selector requirements

- `credentialWalletCategory: certification`
- `cpdEligible` / `recertificationEligible: true`
- `schemeTitle`, `issuedAt`, `validUntil`, `publicNumber`
- Excludes revoked / withdrawn / suspended

### Manual DB mutation (pre-TD-082)

No dedicated revert SQL artifact in repo. TD-081 noted empty selector until seed. F5 runbooks describe API-first cleanup; manual SQL discouraged.

### Schema

`Certificate` + `RecertificationCase` sufficient — **no migration required**.

### Gap fixed in TD-082

Recertification service previously resolved certificate by internal UUID only; wallet exposes `uid`. Minimal lookup fix: resolve by `uid` OR `id` for holder-only paths.

## Decision

Add idempotent ops seed `seed-pilot-certificant-wallet.ts` with fixed IDs, synthetic person certificate `CON-PILOT-000082`, OPEN recert case for CPD hours within T-90 window (`validUntil` ≈ +60 days).
