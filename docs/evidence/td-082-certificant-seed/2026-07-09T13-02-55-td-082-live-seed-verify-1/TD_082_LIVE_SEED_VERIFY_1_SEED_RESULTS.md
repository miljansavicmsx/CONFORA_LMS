# TD-082 Live Seed Verify 1 — Seed Results

**Timestamp:** 2026-07-09T13:02:55+02:00

## Command

```bash
pnpm run ops:seed-pilot-cert-wallet
```

## Run 1

```
TD-082 pilot certificant wallet seeded: CON-PILOT-000082
```

Exit code: 0

## Run 2 (idempotency)

```
TD-082 pilot certificant wallet seeded: CON-PILOT-000082
```

Exit code: 0

## Post-seed DB counts (docker-postgres-1)

| Entity | Query | Count |
|--------|-------|-------|
| Certificate fixture | `cert.certificates` where `uid='CON-PILOT-000082'` | 1 |
| Recert case | `cert.recertification_cases` where `id='a8200001-0000-4000-8000-000000000002'` | 1 |
| USR_CERT role | `pilot.learner2@confora.test` + `USR_CERT` | 1 |

## Idempotency verdict

- No duplicate certificate fixture
- No duplicate recert case
- No duplicate role assignment
- Second run safe

**seed_idempotency_status:** PASS  
**live_seed_status:** PASS
