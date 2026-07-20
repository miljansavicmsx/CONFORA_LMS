# CONFORA-REPO-HEALTH-9 — Next wave recommendation

## Recommended next wave

`W2B_SHARED_TYPES_AND_SHARED_KERNEL_SOURCE`

## Why

- W2A verified: manifests/tsconfigs only.
- RH8 order: W2B = `shared-types` + `shared-kernel` **source** (skim auth/roles/tenant types).
- Do **not** broad-add `packages/` (would pull `database/`, AI, remaining stubs).

## Suggested W2B path group (not executed here)

Explicit paths only, e.g.:

- `packages/shared-types/src/**` (remaining untracked: `auth.ts`, `roles.ts`, `index.ts`, `health.test.ts`)
- `packages/shared-kernel/src/**` + `packages/shared-kernel/README.md`

## Non-actions now

- Do not import W2B in this task
- Do not `git add packages`
- Do not import `database`, `auth`, `ai-*`, or app `src`
