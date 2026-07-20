# CONFORA-REPO-HEALTH-12 — W2C first commit candidate (W2C-1)

## Recommendation

After review, a future tracking task may commit **only** these **7** paths (config tooling):

```
packages/config/csp/build-csp.mjs
packages/config/eslint-rules/index.mjs
packages/config/eslint-rules/no-inline-script-without-nonce.mjs
packages/config/eslint-rules/no-inline-script-without-nonce.test.mjs
packages/config/eslint.config.mjs
packages/config/prettier.config.cjs
packages/config/scripts/write-build-stamp.mjs
```

## Rules

1. `git add` **only** the paths above.
2. Do not include audit-client, sdk, ui, or notification-templates in the first W2C commit.
3. Do not `git add packages/config` if that would pull unexpected extras (list is exhaustive today).
4. Suggested message focus: shared eslint/prettier/CSP tooling configs.

## Out of first commit

- `packages/audit-client/src/**` (W2C-2)
- `packages/sdk/src/**` (W2C-3)
- `packages/ui/**`, `packages/notification-templates/**` (defer)
- database / auth / AI / app source / ops / evidence
