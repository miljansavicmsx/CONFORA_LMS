# CONFORA-REPO-HEALTH-8 — W2A first commit candidate

## Recommendation

After human review of this list, a future tracking task may commit **only** these **26** paths.

```
packages/audit-client/package.json
packages/audit-client/tsconfig.build.json
packages/audit-client/tsconfig.json
packages/config/package.json
packages/config/typescript/base.json
packages/config/typescript/nestjs.json
packages/config/typescript/nextjs.json
packages/config/typescript/node-library.json
packages/config/typescript/react-library.json
packages/notification-templates/package.json
packages/notification-templates/tsconfig.build.json
packages/notification-templates/tsconfig.json
packages/sdk/package.json
packages/sdk/tsconfig.build.json
packages/sdk/tsconfig.json
packages/shared-kernel/package.json
packages/shared-kernel/tsconfig.build.json
packages/shared-kernel/tsconfig.json
packages/shared-types/package.json
packages/shared-types/tsconfig.build.json
packages/shared-types/tsconfig.json
packages/ui/package.json
packages/ui/postcss.config.cjs
packages/ui/tailwind.config.ts
packages/ui/tsconfig.build.json
packages/ui/tsconfig.json
```

## Rules for the future W2A task

1. `git add` **only** the paths above (no directory wildcards that pull source).
2. Confirm each path still untracked and unchanged.
3. Do not include `packages/database/**`, `packages/auth/**` source, AI packages, or any `src/**`.
4. Suggested message focus: shared package manifests/tsconfigs for monorepo continuity.

## Out of W2A

- All `src/**` under packages
- `packages/config/eslint*`, `prettier*`, `csp/**`, `scripts/**`
- `packages/ai-client/**` (including `.js`/`.map`)
- `packages/database/**`
- README-only stubs (`auth`, `audit`, `types`, `ai-governance`)
