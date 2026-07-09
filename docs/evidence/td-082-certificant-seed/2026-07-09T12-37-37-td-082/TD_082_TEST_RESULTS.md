# TD-082 Test Results

| Suite | Result |
|-------|--------|
| `packages/database/test/td-082-pilot-certificant-wallet.test.ts` | 2 passed (idempotency) |
| `apps/api/test/td-082-pilot-certificant-wallet.e2e-spec.ts` | 6 passed |
| `apps/api/test/b2-learner-cert-wallet.e2e-spec.ts` | 7 passed (regression) |
| `frontend-app` certificate selector tests | 8 passed |

## Commands

```powershell
cd packages/database && pnpm test
cd apps/api && pnpm test:e2e -- td-082-pilot-certificant-wallet.e2e-spec.ts b2-learner-cert-wallet.e2e-spec.ts
cd frontend-app && pnpm exec vitest run src/lib/__tests__/certificate-selector.test.ts src/components/learner/__tests__/certificate-selector.test.tsx
```

## Coverage matrix

| Requirement | Test |
|-------------|------|
| Seed idempotent | database unit test |
| Non-empty wallet API | TD-082 e2e |
| Tenant / user isolation | TD-082 + B2 e2e |
| Selector fields | TD-082 e2e |
| UI selector component | vitest |
| Empty state | vitest + e2e (other user) |
