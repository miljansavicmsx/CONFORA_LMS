# CONFORA REPO HEALTH 44 — apps/api Source Baseline

## Tracked

| Metric | Value |
|--------|------:|
| Tracked `apps/api` files (all) | 20 |
| Tracked `apps/api/src` files | **10** |

### Tracked `src` modules

- `app.module.ts`
- `auth/` (actor-db-access, resolve-db-user + specs)
- `cert-governance/recertification.service.ts`
- `cert-wallet/me-certificates.service.ts` (+ spec)
- `prisma/` (tenant extension, access-violation filter)

### AI-related tracked source

**Absent.** `apps/api/src/ai`, `course-authoring`, `exam` do not exist on disk and are not tracked.

## Generated / on-disk (not tracked)

| Path | Exists | Tracked | Ignore |
|------|:------:|:-------:|--------|
| `apps/api/dist` | yes | 0 | `.gitignore` `apps/**/dist/` |
| `apps/api/coverage` | yes | 0 | `coverage/` |
| `apps/api/node_modules` | yes | 0 | `**/node_modules/` |
| `apps/api/.turbo` | yes | 0 | `.turbo/` |

## RH43 status

**rh43_rework_currently_blocked:** true — no canonical AI gateway source to patch (per RH43A).

## apps_api_ai_source_present

**false**
