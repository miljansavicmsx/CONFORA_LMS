# 03 Source and Test Scope

SOURCE_CHANGED_PATHS =

1. frontend-app/src/layouts/DashboardLayout.tsx
2. frontend-app/src/stores/dashboard-layout-store.ts
3. frontend-app/src/contexts/WorkspaceContext.tsx
4. frontend-app/src/components/ui/tooltip.tsx
5. frontend-app/src/lib/permissions.ts
6. frontend-app/src/lib/jwt-payload.ts

SOURCE_CHANGE_JUSTIFICATION =
Missing modules required to execute the real DashboardLayout were introduced as minimal shims.
DashboardLayout gained data-testid attributes for runtime assertions.
Header/Sidebar production trees remain stubbed only inside the e2e harness aliases (not replaced in production).

TEST_CHANGED_PATHS =

1. frontend-app/e2e/csp-preview-enforce-smoke.spec.ts
2. frontend-app/e2e/csp-dashboard-runtime/index.html
3. frontend-app/e2e/csp-dashboard-runtime/main.tsx
4. frontend-app/e2e/csp-dashboard-runtime/vite.config.mjs
5. frontend-app/e2e/csp-dashboard-runtime/stubs/Header.tsx
6. frontend-app/e2e/csp-dashboard-runtime/stubs/Sidebar.tsx
7. frontend-app/src/test/**tests**/dashboard-layout.csp-compat.test.ts
8. frontend-app/src/test/**tests**/dashboard-layout.runtime.test.ts

PACKAGE_JSON_CHANGED_PATH_COUNT = 0
LOCKFILE_CHANGED_PATH_COUNT = 0
NEW_DEPENDENCY_COUNT = 0
