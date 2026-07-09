# TD-082 API Results

| Check | Result | Evidence |
|-------|--------|----------|
| Non-empty wallet for certificant | PASS | `td-082-pilot-certificant-wallet.e2e-spec.ts` |
| Selector fields present | PASS | `schemeTitle`, `recertificationEligible`, `cpdEligible`, `publicNumber` |
| Anonymous denied | PASS | 401 |
| Own-certificate scope | PASS | `userId` = pilot learner2 in Prisma query |
| Other candidate empty | PASS | `pilot.learner` → `items: []` |
| Wrong tenant denied | PASS | 403 tenant mismatch |
| Privacy allowlist | PASS | No forbidden keys in JSON |
| Recert lookup by wallet UID | PASS | `recertification.service.ts` resolves `uid` or `id` |

## Tests run

```
pnpm test:e2e -- td-082-pilot-certificant-wallet.e2e-spec.ts b2-learner-cert-wallet.e2e-spec.ts
→ 13 passed
```

## Live DB seed run

Blocked in this environment (`DATABASE_URL` not set). Seed logic verified via unit test + mocked e2e. Run locally after docker Postgres up.
