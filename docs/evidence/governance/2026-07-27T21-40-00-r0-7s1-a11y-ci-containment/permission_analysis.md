# Permission analysis (R0-7S1)

## Effective permission matrix

| Permission | Effective value | Purpose | Mutation capability | Accepted |
|------------|-----------------|---------|---------------------|----------|
| `contents` | `read` | checkout / read repository | no repository-content write | yes |
| `pull-requests` | `write` | post PR accessibility summary | PR comment only in current workflow | conditionally yes |

## Workflow facts

- No merge, close, label, retitle, or other PR-state mutation command exists in
  `.github/workflows/accessibility.yml`.
- `contents: write` is absent.
- Token grant is workflow-scoped; no job overrides.

## Re-evaluation gate (R0-7D)

When `scripts/a11y/pr-comment.mjs` becomes tracked, R0-7D must either:

1. prove the script posts comments only; or
2. remove `pull-requests: write`.

Until then, classification remains `JUSTIFIED_AND_BOUNDED` for the **current
workflow text**, not for an untracked script body.
