# CONFORA-REPO-HEALTH-28 — Do Not Import

## Deferred

| Path | Reason |
|------|--------|
| `packages/notification-templates/templates/**` | MJML remain deferred |

## Always out of this wave

| Path / pattern | Reason |
|----------------|--------|
| `packages/ui/**` | Closed UI wave |
| `packages/database/**` / `packages/auth/**` / `packages/ai-*/**` | Out of wave |
| `apps/**` / `frontend-app/**` / `scripts/**` / `terraform/**` | Out of wave |
| `package.json` / lockfile / workspace config | Must not change here |
| Broad `git add packages` / `git add packages/notification-templates` | Forbidden |

## This verification

Source staged after verification: **false** · No source imported in this task.
