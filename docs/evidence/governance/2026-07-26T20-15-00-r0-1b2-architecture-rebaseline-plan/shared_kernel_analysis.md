# Shared-kernel architecture analysis

**Source:** docs/SHARED_KERNEL_STANDARD.md (untracked)

## Package reality (verified facts)

| Package | Tracked | Local | Notes |
|---------|---------|-------|-------|
| packages/shared-kernel | Yes (incl. src/entities.ts, 	enant.ts) | Yes | Partial implementation — doc "placeholder" claim outdated |
| packages/shared-types | Yes | Yes | RBAC/JWT related contracts |
| packages/auth | No | Yes | Target contracts missing from clean clone |
| packages/audit | No | Yes | Target ledger helpers missing from clean clone |
| packages/ai-governance | No | Yes | Missing from clean clone |
| packages/database | No | Yes | Intended Prisma home missing from clean clone |
| packages/types | No | Yes | STRUCTURE rename target from shared-types |
| packages/ui, i18n, sdk, config, udit-client, i-client, i-prompts, 
otification-templates | Yes (names) | Yes | Mixed |

## Cross-context / coupling observations

- STRUCTURE.md maps shared-types → 	ypes and udit-client → udit — migration not executed in tracked tree.
- Duplicate domain primitives risk while FastAPI ackend/ remains local-untracked alongside Nest types.
- Generated-file boundaries: ensure dist/coverage never promoted.

## Classification

PROMOTE_WITH_REBASELINE to docs/architecture/SHARED_KERNEL_STANDARD.md with refreshed package status table.
