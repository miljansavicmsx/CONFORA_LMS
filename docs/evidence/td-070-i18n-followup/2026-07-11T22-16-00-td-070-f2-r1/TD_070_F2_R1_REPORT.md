# TD-070-F2-R1 Report — Restore admin_gov and learner acceptance

**Task ID:** TD-070-F2-R1  
**Evidence folder:** `docs/evidence/td-070-i18n-followup/2026-07-11T22-16-00-td-070-f2-r1/`  
**Date:** 2026-07-11

## Executive summary

TD-070-F2 refactored sidebar nav items to i18n keys (`labelKey`/`titleKey`) but left command-center providers reading legacy `label`/`title` fields. On dashboard load, `certificationProvider` called `section.title.toLowerCase()` on `undefined`, crashing React and producing a blank shell. Both admin_gov and learner Playwright suites failed because shared layout never rendered.

A narrow fix localizes sidebar sections in command-center index building using the same helper as `Sidebar.tsx`. All targeted tests, acceptance suites, and sequential regression now pass.

**Final verdict:** `TD_070_F2_R1_GO_BASELINE_RESTORED`

## Root cause

Command-center nav providers (`learning`, `governance`, `system`, `certification`) consumed raw `SidebarSectionDef` objects without calling `localizeSidebarSection`. After F2, `section.title` and `item.label` were undefined; `certification-provider.ts` crashed first on `.toLowerCase()`.

## Fix

- Added `sidebar-nav-command-entities.ts` shared builder with i18n resolution
- Threaded `TFunction` through `buildCommandSearchIndex` and `GlobalCommandCenter`
- Updated command-search-engine unit tests to use `createConforaI18n`

## Files changed

| File | Change |
|------|--------|
| `frontend-app/src/components/command-center/providers/sidebar-nav-command-entities.ts` | **NEW** |
| `frontend-app/src/components/command-center/providers/learning-provider.ts` | Use shared localizer |
| `frontend-app/src/components/command-center/providers/governance-provider.ts` | Use shared localizer |
| `frontend-app/src/components/command-center/providers/system-provider.ts` | Use shared localizer |
| `frontend-app/src/components/command-center/providers/certification-provider.ts` | Use shared localizer |
| `frontend-app/src/components/command-center/command-search-index.ts` | Accept `t` param |
| `frontend-app/src/components/command-center/GlobalCommandCenter.tsx` | `useTranslation(NAVIGATION_NS)` |
| `frontend-app/src/components/command-center/__tests__/command-search-engine.test.ts` | Pass i18n `t` |

## Governance constraints

| Constraint | Status |
|------------|--------|
| Prisma schema | Not changed |
| Migrations | Not changed |
| API contracts | Not changed |
| RBAC weakened | No |
| Tenant isolation weakened | No |
| Privacy weakened | No |
| Governance boundaries weakened | No |
| Acceptance tests weakened | No |
| External pilot approved | No |

## Test summary

- i18n: 128/128 PASS
- Frontend targeted: 20/20 PASS
- admin_gov: 15/15 PASS (`ADMIN_GOV_FINAL_ACCEPTANCE_GO`)
- learner: 11/11 PASS (`LEARNER_FINAL_ACCEPTANCE_1R_GO`)
- Sequential: 6/6 PASS (`TD_085_GO_LOCAL_BASELINE_CONFIRMED`)

## Navigation accessible name

Restored. Sidebar renders with `aria-label` from `a11y:main_navigation` → `"Glavna navigacija"` for HR pilot locale. Confirmed by admin_gov `sidebar_breadcrumb_status: PASS`.
