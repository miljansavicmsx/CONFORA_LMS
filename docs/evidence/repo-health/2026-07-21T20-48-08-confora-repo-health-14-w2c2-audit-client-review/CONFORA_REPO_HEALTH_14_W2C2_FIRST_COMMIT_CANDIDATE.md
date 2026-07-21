# CONFORA-REPO-HEALTH-14 — W2C-2 first commit candidate

## Recommendation

After human skim of the token-callback transport, a future tracking task may commit **only** these **2** paths:

```
packages/audit-client/src/index.ts
packages/audit-client/src/append.test.ts
```

## Rules

1. `git add` **only** the paths above (not `packages/audit-client/`).
2. Do not include sdk, ui, notification-templates, database, auth, AI, apps, frontend, scripts, terraform, or evidence.
3. Suggested message focus: audit ledger append client schema + tests.

## Pre-add skim checklist

- [ ] No hardcoded access tokens / JWTs in `index.ts`
- [ ] Test fixtures remain action-identifier only
- [ ] Tenant scoping rules still clear (tenantScoped requires tenantId)
