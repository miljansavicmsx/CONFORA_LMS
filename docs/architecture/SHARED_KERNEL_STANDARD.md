# CONFORA Shared Kernel Standard

| Field | Value |
|-------|-------|
| **Document ID** | CON-ARCH-KERNEL-001 |
| **Status** | Normative architecture (R0-1B2.1) |
| **Date** | 2026-07-26 |
| **Authority** | Subordinate to owner decisions and Baseline |

## Verified package availability (clean clone)

| Package | Tracked files | Available on clean clone? |
|---------|---------------|---------------------------|
| packages/shared-kernel | 9 | Yes (partial implementation) |
| packages/shared-types | 8 | Yes (partial) |
| packages/ui | 11 | Yes (partial) |
| packages/i18n | 50 | Yes (partial) |
| packages/audit-client | 5 | Yes (client) |
| packages/config | tracked | Yes |
| packages/sdk | tracked | Yes (treat generated outputs carefully) |
| packages/database | 0 | **No** |
| packages/auth | 0 | **No** |
| packages/audit | 0 | **No** |
| packages/ai-governance | 0 | **No** |
| packages/types | 0 | **No** |

Do **not** claim untracked packages are available on a clean clone.

## Allowed shared-kernel contents

- Domain primitives and value objects
- Pure functions and schemas for cross-cutting IDs (e.g., tenant id parsing)
- Shared error codes / event **type** definitions
- No HTTP controllers, Prisma models, React components, or feature services

## Forbidden domain leakage

- Bounded-context business workflows must not live in shared-kernel
- Apps must not import another app's internal modules via kernel workarounds

## Dependency direction

`	ext
apps/*  -->  packages/*  -->  (no dependency back into apps)
packages/shared-kernel  -->  (minimal; no Nest/Prisma/React)
`

## Cross-context imports

- Prefer shared-types / kernel contracts at boundaries
- Duplicate primitives across FastAPI local tree and Nest types are a known drift risk (C-09) while FastAPI remains untracked

## Generated output handling

- Generated SDK/OpenAPI outputs are GENERATED
- Never commit hand-edited generated trees as normative source without review

## Public API boundaries

- Packages expose explicit src/index.ts (or documented entry) public surfaces
- Deep imports into package internals are discouraged

## Versioning

- Workspace packages use monorepo versioning discipline; breaking contract changes require Architecture Board review

## Test and evidence requirements

- Kernel changes need unit tests (example: tracked packages/shared-kernel/src/tenant.test.ts)
- Evidence of clean-clone install/build for consumers is required before claiming completeness

## Legacy compatibility boundaries

- Local FastAPI must not be treated as a second shared-kernel SoT
- Transitional udit-client must not be described as the full audit ledger package

## Non-claims

- Shared-kernel is **not** “placeholder only” (tracked source exists) and also **not** complete.
- Auth/audit/database package completeness is **not** claimed.
