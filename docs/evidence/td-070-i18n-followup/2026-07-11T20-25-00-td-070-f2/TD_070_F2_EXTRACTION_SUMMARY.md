# TD-070-F2 Extraction Summary

## Production files changed (representative)
- `packages/i18n/src/keys.ts`, `resources.ts`, `create-i18n.ts`, `index.ts`
- `packages/i18n/locales/{en,bs,sr,hr,sl}/{navigation,dashboard,common}.json`
- `packages/i18n/locales/*/shell.json`, `a11y.json`, `candidatePortal.json`
- `frontend-app/src/components/layout/sidebar-nav-types.ts`
- `frontend-app/src/components/layout/sidebar-sections.tsx`
- `frontend-app/src/components/layout/localize-sidebar-sections.ts`
- `frontend-app/src/components/layout/Sidebar.tsx`
- `frontend-app/src/components/layout/Header.tsx`
- `frontend-app/src/lib/nest-auth-pilot.ts`
- `frontend-app/src/lib/inactive-feature-visibility.ts`
- `frontend-app/src/lib/format-role-label.ts`
- `frontend-app/src/lib/use-documents-certificates-labels.ts`
- `frontend-app/src/pages/dashboard/DashboardHome.tsx`
- `frontend-app/src/pages/learner/MyCertificates.tsx`
- Tests: `td-070-f2-i18n.test.tsx`, updated `sidebar-sections.test.ts`

## Surfaces extracted
- Navigation sidebar (all roles, key-based)
- Shell chrome (sidebar badge/settings, header workspace/notifications/user menu)
- Dashboard pilot empty state + loading skeleton aria
- Learner wallet hero, filters, section notices, empty states, PDF/public-verify actions
- Role label hook for header badge path

## Preserved
- `data-testid` attributes unchanged
- Route paths unchanged
- RBAC guards unchanged
- No API/schema/RBAC changes
