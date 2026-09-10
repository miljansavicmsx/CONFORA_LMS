# 04 Remediation Source Diff Scope

REMEDIATION_SOURCE_CHANGED_PATH_COUNT = 2
REMEDIATION_SOURCE_CHANGED_PATHS =

1. frontend-app/src/layouts/DashboardLayout.tsx
2. frontend-app/vite-csp-preview.mjs

REMEDIATION_TEST_CHANGED_PATH_COUNT = 4
REMEDIATION_TEST_CHANGED_PATHS =

1. frontend-app/e2e/csp-preview-enforce-smoke.spec.ts
2. frontend-app/src/test/**tests**/dashboard-layout.csp-compat.test.ts
3. frontend-app/src/test/**tests**/vite-csp-preview.bootstrap.test.ts
4. frontend-app/src/test/**tests**/vite-csp-preview.entry-html.test.ts

REMEDIATION_NON_EVIDENCE_CHANGED_PATH_COUNT = 6
UNAUTHORIZED_SOURCE_CHANGED_PATH_COUNT = 0
UNAUTHORIZED_TEST_CHANGED_PATH_COUNT = 0
PACKAGE_JSON_CHANGED_PATH_COUNT = 0
LOCKFILE_CHANGED_PATH_COUNT = 0
FORBIDDEN_SCOPE_CHANGED_PATH_COUNT = 0
MD01_SOURCE_CHANGED_BY_REMEDIATION = false
