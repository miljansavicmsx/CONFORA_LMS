# TD-070-F2 Discovery

## Scope audited
- `frontend-app/src/pages/dashboard` (pilot home, skeleton)
- `frontend-app/src/components/layout` (Sidebar, Header, sidebar-sections)
- `frontend-app/src/layouts/DashboardLayout.tsx` (mobile nav — partial)
- `frontend-app/src/pages/learner/MyCertificates.tsx` (wallet)
- `frontend-app/src/lib/format-role-label.ts`, `use-documents-certificates-labels.ts`
- `packages/i18n` namespaces

## F2 in scope (extracted)
| Surface | Finding | Action |
|---------|---------|--------|
| Sidebar sections (~95 labels) | Hardcoded HR/BS mix | `navigation` namespace + `labelKey`/`titleKey` |
| Sidebar chrome | Badge, settings, expand/collapse aria | `shell` + `a11y` |
| Header chrome | Workspace picker, notifications, user menu, search | `shell` + `a11y` |
| Dashboard pilot empty | Pilot title/unavailable/open catalog | `dashboard` |
| Dashboard skeleton aria | Loading label | `dashboard` |
| Learner wallet hero/filters/notices | MyCertificates core copy | `candidatePortal.wallet` |
| Role badge helper | formatRoleLabel | `dashboard.roles` hook |
| Nest pilot learner sidebar | Duplicate labels | `labelKey` alignment |

## Deferred (later i18n slice)
- `LearnerDashboardEnterprise.tsx` (~80 strings)
- `DashboardHome.tsx` legacy role panels, greetings, fallback workspace cards
- `FinancePage.tsx` full finance workspace
- `dashboard-breadcrumbs.ts` segment map (keys prepared in `navigation.breadcrumbs`)
- `DashboardLayout.tsx` mobile nav label strings (pilot mobile nav in `nest-auth-pilot.ts`)
- Committee/landing/public marketing copy
- `admin-gov-ux-labels.ts` (F1 deferral — acceptance stability)

## Not suitable yet
- API/backend error catalog
- Notification/email/PDF localization
- Route path or RBAC guard changes
- DEV-only strings
