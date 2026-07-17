# APPEALS-COMPLAINTS-2R Browser Discovery

| Item | Value |
|------|-------|
| Based on | `22adee4` |
| Prior verdict | APPEALS_COMPLAINTS_2_GO_STAFF_RESOLUTION_UX_CONFIRMED |
| Stack PG/KC/API | UP |
| Learner Nest auth | PASS |
| Staff Nest auth | PASS (ok) |
| Staff email env | PLAYWRIGHT_STAFF_EMAIL → `pilot.sysadmin@confora.test` (password from env only) |
| Password env present | true |
| frontend-app/.env.local | existing |
| Playwright port | 3011 + VITE_AUTH_PROVIDER=nest |

## Auth note

Director/manager Nest login may require MFA on this stack. Default staff account for 2R is `pilot.sysadmin@confora.test` (`sys_admin`) which accepts password-only Nest login locally. Override with `PLAYWRIGHT_STAFF_EMAIL` when needed.

## Routing fix (browser-exposed)

First browser run redirected staff routes to `/dashboard` because Nest auth pilot allowlist omitted appeals/complaints staff paths. Smallest fix: allow

- `/dashboard/admin/appeals-complaints`
- `/dashboard/admin/support`
- `/dashboard/iso/appeals`
- `/dashboard/iso/complaints`

in `NEST_AUTH_PILOT_STAFF_DASHBOARD_PREFIXES` (`frontend-app/src/lib/nest-auth-pilot.ts`). RBAC via `StaffAppealsComplaintsGuard` still denies learners (`/unauthorized`).

## Routes under test

- `/dashboard/admin/appeals-complaints`
- `/dashboard/iso/appeals`
- `/dashboard/iso/complaints` (expects Prigovori tab)
- Learner denial of staff route → `/unauthorized`
