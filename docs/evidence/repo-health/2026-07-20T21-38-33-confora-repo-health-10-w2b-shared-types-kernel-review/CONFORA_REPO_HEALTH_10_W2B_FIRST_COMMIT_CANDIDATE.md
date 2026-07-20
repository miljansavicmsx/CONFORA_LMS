# CONFORA-REPO-HEALTH-10 — W2B first commit candidate

## Recommendation

After human skim of `auth.ts`, `roles.ts`, and `tenant.ts`, a future tracking task may commit **only** these **10** paths:

```
packages/shared-types/src/auth.ts
packages/shared-types/src/roles.ts
packages/shared-types/src/index.ts
packages/shared-types/src/health.test.ts
packages/shared-kernel/src/tenant.ts
packages/shared-kernel/src/tenant.test.ts
packages/shared-kernel/src/audit-context.ts
packages/shared-kernel/src/entities.ts
packages/shared-kernel/src/index.ts
packages/shared-kernel/README.md
```

## Rules for the future W2B task

1. `git add` **only** the paths above.
2. Do not `git add packages/` or directory-wide package roots.
3. Do not include `packages/database/**`, `packages/auth/**`, `packages/ai-*/**`, app `src`, `scripts/ops`, or evidence bulk.
4. Suggested message focus: shared types + tenant kernel source contracts.

## Pre-add skim checklist

- [ ] `auth.ts` — schemas/permissions only; no live JWT/password values
- [ ] `roles.ts` — role enum only
- [ ] `tenant.ts` — fixture UUIDs acceptable as non-secrets
