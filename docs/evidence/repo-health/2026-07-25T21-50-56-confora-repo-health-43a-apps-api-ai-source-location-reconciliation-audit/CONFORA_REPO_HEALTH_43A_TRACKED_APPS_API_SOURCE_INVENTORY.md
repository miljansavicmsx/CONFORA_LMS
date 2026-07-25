# CONFORA REPO HEALTH 43A — Tracked apps/api Source Inventory

## Command

```text
git ls-files apps/api/src
```

## Result — 10 tracked files under `apps/api/src`

| Path |
|------|
| `apps/api/src/app.module.ts` |
| `apps/api/src/auth/actor-db-access.spec.ts` |
| `apps/api/src/auth/actor-db-access.ts` |
| `apps/api/src/auth/resolve-db-user.spec.ts` |
| `apps/api/src/auth/resolve-db-user.ts` |
| `apps/api/src/cert-governance/recertification.service.ts` |
| `apps/api/src/cert-wallet/me-certificates.service.spec.ts` |
| `apps/api/src/cert-wallet/me-certificates.service.ts` |
| `apps/api/src/prisma/prisma-tenant-extension.ts` |
| `apps/api/src/prisma/tenant-access-violation.filter.ts` |

## Directories represented (tracked)

- `app.module.ts` (root)
- `auth/`
- `cert-governance/`
- `cert-wallet/`
- `prisma/`

**Absent from tracked tree:** `ai/`, `course-authoring/`, `exam/`, and other RH42-mentioned modules.

## Full tracked `apps/api` (20 files)

Adds package/jest/tsconfig configs + 2 e2e specs under `apps/api/test/`. No AI gateway sources.

## RH42 target path existence

| Path | Tracked | On disk |
|------|---------|---------|
| `apps/api/src/ai/ai-gateway.service.ts` | **false** | **false** |
| `apps/api/src/course-authoring/course-authoring.service.ts` | **false** | **false** |
| `apps/api/src/exam/exam-engine.service.ts` | **false** | **false** |

**tracked_apps_api_src_file_count:** 10
