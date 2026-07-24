# CONFORA-REPO-HEALTH-25 — Do Not Import

## This wave (until rework / separate GO)

| Path | Reason |
|------|--------|
| `src/events.ts` | REWORK_REQUIRED |
| `src/index.ts` | REWORK_REQUIRED |
| `templates/**` | DEFER |

## Always out of this wave

| Path / pattern | Reason |
|----------------|--------|
| `packages/ui/**` | Closed UI wave |
| `packages/database/**` | Out of wave |
| `packages/auth/**` | Out of wave |
| `packages/ai-*/**` | Out of wave |
| `apps/**` / `frontend-app/**` | Out of wave |
| `scripts/**` / `terraform/**` | Out of wave |
| `package.json` / lockfile / workspace config | Must not change here |
| Broad `git add packages` / `git add packages/notification-templates` | Forbidden |

## Staging / import this task

- Source staged: **false**
- Source imported: **false**
- Emails sent: **false**
