# TD-070-F2 Namespace Plan

## New namespaces
| Namespace | Purpose |
|-----------|---------|
| `navigation` | Sidebar section titles, nav items, mobile short labels, breadcrumb segment keys |
| `dashboard` | Dashboard pilot, role labels/missions (partial), idle copy keys, workspace header |
| `common` | Shared retry/refresh/loading in F2 surfaces |

## Updated namespaces
| Namespace | Additions |
|-----------|-----------|
| `shell` | `sidebar.*`, `workspace.*`, `userMenu.*`, `notifications.*`, `search.placeholder` |
| `a11y` | `dashboard_home`, `main_navigation`, `expand_sidebar`, `collapse_sidebar`, `workspace_picker`, `breadcrumb`, `quick_actions`, `mobile_navigation`, `workspace_loading`, `wallet_filter` |
| `candidatePortal` | `wallet.*` (filters, hero, notices, document types, status labels) |

## Locales
`en`, `bs`, `sr`, `hr`, `sl` — key parity enforced by `packages/i18n/test/locales-complete.test.ts` (128 tests).

## Wiring pattern
- Sidebar defs use `labelKey` / `titleKey`; `localizeSidebarSections()` resolves at render time.
- Wallet uses `useDocumentsCertificatesLabels()` hook.
- Header/Sidebar use `useTranslation(SHELL_NS)` + `useTranslation(A11Y_NS)`.
