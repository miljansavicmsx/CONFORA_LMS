# 03 Four Bad Shim Root Causes And Dispositions

Forbidden production paths (absent on 86aca155e4f3924617c290bb4771bd188dbefa73):

- frontend-app/src/components/ui/tooltip.tsx
- frontend-app/src/contexts/WorkspaceContext.tsx
- frontend-app/src/lib/jwt-payload.ts
- frontend-app/src/lib/permissions.ts

Disposition applied: DELETE_AND_USE_TEST_LOCAL_MOCK_OR_ALIAS
PRODUCTION_IMPLEMENTATION_REQUIRED_FOR_C3S10 = false

Resolution used:

- E2E aliases in e2e/csp-dashboard-runtime/vite.config.mjs -> stubs/\*
- Vitest-only resolve aliases in frontend-app/vite.config.ts (mode===test / VITEST) -> same stubs
- Vitest vi.mock for Header/Sidebar and supporting providers

BAD_PRODUCTION_SHIM_INTRODUCED_PATH_COUNT = 0
HISTORICAL_CANONICAL_MODULE_RESTORE_COUNT = 0
