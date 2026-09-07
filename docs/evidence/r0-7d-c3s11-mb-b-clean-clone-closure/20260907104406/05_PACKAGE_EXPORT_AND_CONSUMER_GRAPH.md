# Package Export And Consumer Graph

## @confora/i18n exports

- main = ./dist/index.js
- types = ./dist/index.d.ts
- exports[.] import/default = ./dist/index.js
- exports[./react] import/default = ./dist/react.js

## @confora/ui exports

- main = ./dist/index.js
- exports[.] = ./dist/index.js
- exports[./styles.css] = ./dist/styles.css
- exports[./tokens] = ./tokens.ts (tracked source; not C3-S11 subject)

## Active consumers

C3S11_ACTIVE_CONSUMER_COUNT = 23

Production:

- frontend-app/src/main.tsx (@confora/i18n/react, @confora/ui/styles.css)
- frontend-app/src/App.tsx (@confora/i18n/react)
- frontend-app/src/layouts/DashboardLayout.tsx (@confora/ui, @confora/i18n)
- frontend-app/src/pages/Login.tsx (@confora/i18n)
- frontend-app/src/pages/admin/AdminReportsPage.tsx (@confora/i18n)
- frontend-app/src/pages/learner/AppealsComplaintsPage.tsx (@confora/i18n)
- frontend-app/src/pages/learner/MyRecertificationsPage.tsx (@confora/i18n)
- frontend-app/src/components/layout/Header.tsx (@confora/i18n)
- frontend-app/src/components/layout/Sidebar.tsx (@confora/i18n)
- frontend-app/src/components/layout/localize-sidebar-sections.ts (@confora/i18n)
- frontend-app/src/components/i18n/LanguageSwitcher.tsx (@confora/i18n)
- frontend-app/src/components/learner/CertificateSelector.tsx (@confora/i18n)
- frontend-app/src/components/grievances/FormalComplaintDialog.tsx (@confora/i18n)
- frontend-app/src/components/command-center/GlobalCommandCenter.tsx (@confora/i18n)
- frontend-app/src/lib/locale-preference.ts (@confora/i18n)
- frontend-app/src/lib/format-role-label.ts (@confora/i18n)
- frontend-app/src/lib/candidate-portal-status-label.ts (@confora/i18n)
- frontend-app/src/lib/use-documents-certificates-labels.ts (@confora/i18n)

Test:

- frontend-app/src/components/i18n/**tests**/language-switcher.test.tsx
- frontend-app/src/components/layout/**tests**/td-070-f2-i18n.test.tsx
- frontend-app/src/components/command-center/**tests**/command-search-engine.test.ts
- frontend-app/src/lib/**tests**/locale-preference.test.ts
- frontend-app/src/lib/**tests**/admin-reports-api.test.ts

Build/config consumers:

- frontend-app/package.json file: dependencies on @confora/i18n and @confora/ui
