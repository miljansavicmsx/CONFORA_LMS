# TD-070-F2-R1 Fix Summary

## Approach

Narrow fix: localize sidebar sections in command-center nav providers using the same `localizeSidebarSection` helper as `Sidebar.tsx`. No revert of TD-070-F2 i18n extraction.

## Changes

### New file

- `frontend-app/src/components/command-center/providers/sidebar-nav-command-entities.ts`  
  Shared helper `buildSidebarNavCommandEntities(isoCtx, t, options)` that:
  1. Collects tagged sidebar section defs via `collectTaggedSidebarSections`
  2. Localizes each section with `localizeSidebarSection(sectionDef, t)`
  3. Builds `CommandEntity` rows with resolved `title`/`subtitle` strings

### Updated providers

All four sidebar-derived providers now accept `TFunction` and use the shared helper:

- `learning-provider.ts`
- `governance-provider.ts`
- `system-provider.ts`
- `certification-provider.ts` (cert filter now uses localized `section.title`)

### Index + shell wiring

- `command-search-index.ts` — `buildCommandSearchIndex(isoCtx, workspace, t)` requires `t`
- `GlobalCommandCenter.tsx` — `useTranslation(NAVIGATION_NS)` passes `tNav` into index builder

### Test update

- `command-search-engine.test.ts` — uses `createConforaI18n` + `i18n.t.bind(i18n)` for index tests

## Preserved behavior

- Route paths unchanged
- `data-testid` attributes unchanged
- RBAC, tenant isolation, route guards unchanged
- Sidebar `aria-label` remains i18n-driven (`a11y:main_navigation` → `"Glavna navigacija"` for HR pilot locale)
- TD-070-F2 `labelKey`/`titleKey` sidebar defs retained

## Out of scope

- Prisma schema / migrations — not touched
- API contracts — not touched
- Acceptance test weakening — not done
