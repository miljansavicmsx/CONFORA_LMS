# TD-082 Report — Certificant Seed for CPD Selector

| Field | Value |
|-------|-------|
| Task | TD-082 |
| Date | 2026-07-09 |
| Final verdict | **TD_082_GO** |

## Summary

TD-082 adds a repeatable local/dev seed path so `pilot.learner2@confora.test` (`USR_CERT`) owns a synthetic person certificate visible through `GET /v1/me/certificates` and the CPD/recertification certificate selector. No Prisma schema changes. No manual SQL required after running the seed chain.

## Seeded user

- **Email:** `pilot.learner2@confora.test`
- **ID:** `b2000000-0000-4000-8000-000000000002`
- **Role:** `USR_CERT` (from existing pilot auth seed)

## Seeded certificate

- **UID / public number:** `CON-PILOT-000082`
- **Status:** `ACTIVE`
- **Scheme:** `a1000000-0000-4000-8000-000000000002` (Sample certification scheme)
- **Recert case:** OPEN (`r8200001-0000-4000-8000-000000000001`)

## API selector result

Non-empty wallet with TD-081 selector fields; tenant/user scoped; privacy allowlist holds.

## UI selector result

Component tests pass; after seed, recertifications page auto-selects single eligible certificate without `?certificateId=`.

## Files changed

| File | Change |
|------|--------|
| `packages/database/prisma/seeds/td-082-pilot-certificant-wallet.ts` | New seed lib |
| `packages/database/test/td-082-pilot-certificant-wallet.test.ts` | Idempotency tests |
| `scripts/ops/seed-pilot-certificant-wallet.ts` | CLI + reset |
| `scripts/ops/seed-pilot-auth-users.ts` | Doc comment — run order |
| `apps/api/test/td-082-pilot-certificant-wallet.e2e-spec.ts` | API verification |
| `apps/api/src/cert-governance/recertification.service.ts` | Wallet UID lookup |
| `package.json` | `ops:seed-pilot-cert-wallet` |

## Governance

| Gate | Status |
|------|--------|
| RBAC weakened | false |
| Tenant isolation weakened | false |
| Privacy weakened | false |
| Prisma schema changed | false |
| Production workflow logic changed | false (holder cert resolution only) |

## Local verification note

Live `prisma db seed` run requires `DATABASE_URL` (docker Postgres). Automated tests cover seed contract without live DB in this session.
