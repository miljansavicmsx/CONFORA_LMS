# 06 Clean Clone Provisioning

VERIFY_WORKTREE = C:\CONFORA_R0D_C3S10_R2_BOUNDED_REMEDIATION_R1_VERIFY
VERIFY_SHA = 18f2bf97f6d71b01c32ad436a86f6ef117282ac4
Node = v24.13.1
npm = 11.8.0
pnpm = 9.14.2 via npx

Install:

1. npx pnpm@9.14.2 install --frozen-lockfile (monorepo packages)
2. npm --prefix frontend-app install --no-fund --no-audit (frontend-app is outside pnpm-workspace packages list)
3. npx pnpm@9.14.2 --filter @confora/ui build; --filter @confora/i18n build

MANUAL_NODE_MODULES_REPAIR_PERFORMED = false
CLEAN_CLONE_PROVISIONING_RESULT = PASS
CLEAN_CLONE_TRACKED_MUTATION_COUNT = 0
