# TD-082 Seed Contract

## Run order (local/dev)

```powershell
cd packages/database
pnpm exec prisma db seed
pnpm exec tsx ../../scripts/ops/seed-pilot-auth-users.ts
pnpm exec tsx ../../scripts/ops/seed-pilot-certificant-wallet.ts
```

Or from repo root: `pnpm run ops:seed-pilot-cert-wallet` (after base + pilot user seeds).

## Reset

```powershell
pnpm exec tsx scripts/ops/seed-pilot-certificant-wallet.ts --reset
```

## Fixed identifiers

| Entity | ID / value |
|--------|------------|
| User | `pilot.learner2@confora.test` / `b2000000-0000-4000-8000-000000000002` |
| Role | `USR_CERT` (from pilot auth seed) |
| Tenant | `00000000-0000-4000-8000-000000000001` |
| Scheme | `a1000000-0000-4000-8000-000000000002` |
| Certificate (internal) | `b8200001-0000-4000-8000-000000000001` |
| Certificate UID / public number | `CON-PILOT-000082` |
| Verification hash | 64-hex synthetic (no real PII) |
| Recert case | `r8200001-0000-4000-8000-000000000001` |

## Idempotency

- `certificate.upsert` on fixed `id`
- `recertificationCase.upsert` on fixed `id`
- Safe to rerun; updates dates/status to current fixture window

## Boundaries

- Local/dev synthetic fixture only
- No identity documents, biometrics, or real personal data
- No committee decision chain seeded (certificate is direct fixture; documented as synthetic)
- Does not grant staff/admin roles
