# CONFORA-REPO-HEALTH-16 — W2C-3 first commit candidate

## Recommendation

After brief skim of the OpenAPI fetch helper, a future tracking task may commit **only** these **2** paths:

```
packages/sdk/src/generated/schema.ts
packages/sdk/src/index.ts
```

## Rules

1. `git add` **only** the paths above (not `packages/sdk/`).
2. Do not include ui, notification-templates, database, auth, AI, apps, frontend, scripts, terraform, or evidence.
3. Suggested message focus: SDK OpenAPI stub + placeholder client.

## Pre-add skim checklist

- [ ] `schema.ts` still empty `paths` stub (or intentionally regenerated — out of scope here)
- [ ] No hardcoded production base URL / credentials in `index.ts`
- [ ] No Authorization header added since this review
