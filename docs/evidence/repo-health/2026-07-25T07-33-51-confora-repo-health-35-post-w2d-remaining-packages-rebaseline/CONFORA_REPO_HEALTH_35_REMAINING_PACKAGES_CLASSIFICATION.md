# CONFORA-REPO-HEALTH-35 — Remaining Packages Classification

`remaining_package_count: 8`

| Package | Tracked? | Class | Rationale |
|---------|----------|-------|-----------|
| `i18n` | **yes** (50) | **SAFE_AUDIT_NEXT** | Already in git; no prior RH integrity evidence found; locales + runtime factory; no new import; no package/lock change for audit wave |
| `ai-prompts` | no (9) | **REVIEW_REQUIRED** | Small prompt registry + `fillTemplate` (unescaped); AI governance / exam-item & risk prompts; import would add package.json |
| `ai-client` | no (8*) | **REVIEW_REQUIRED** | Zod metadata + `fetch`/`Bearer` to Nest AI gateway; compiled `src/*.js/.map` must not be imported |
| `database` | no (~75) | **DEFER** | Prisma schema + 60+ migrations; tenant/RLS/PII surface; dedicated DB wave only |
| `ai-governance` | no (README) | **DO_NOT_IMPORT** | Empty stub; planned AI oversight contracts |
| `audit` | no (README) | **DO_NOT_IMPORT** | Stub; legacy note points to closed `audit-client` |
| `auth` | no (README) | **DO_NOT_IMPORT** | Stub; RBAC/JWT domain; real types already in closed `shared-types` |
| `types` | no (README) | **DO_NOT_IMPORT** | Stub; planned migration target from `shared-types` — dual-home risk |

## Counts

| Class | Count |
|-------|------:|
| SAFE_AUDIT_NEXT | **1** |
| REVIEW_REQUIRED | **2** |
| DEFER | **1** |
| DO_NOT_IMPORT | **4** |
