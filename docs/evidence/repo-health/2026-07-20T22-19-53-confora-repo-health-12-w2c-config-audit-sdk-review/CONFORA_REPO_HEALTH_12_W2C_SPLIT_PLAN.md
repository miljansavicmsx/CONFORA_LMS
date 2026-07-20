# CONFORA-REPO-HEALTH-12 — W2C split plan

Do **not** `git add packages/`.

| Sub-wave | Scope | Count | Gate |
|----------|-------|------:|------|
| **W2C-1** (first) | `packages/config` remaining tooling only | **7** | Low — recommended first commit |
| **W2C-2** | `packages/audit-client/src/**` | 2 | Skim append schema + token callback |
| **W2C-3** | `packages/sdk/src/**` (incl. generated stub) | 2 | Confirm stub remains empty paths |
| **Defer** | `packages/ui/**` untracked; `packages/notification-templates/**` untracked | 6 + 9 | Later product/UI wave |

## Explicit non-goals

- No database / auth package / AI packages
- No apps/api or frontend-app source
- No scripts/ops or docs/evidence bulk
