# 05 Valid Production Source Subset

Exactly two production source paths in 86aca155e4f3924617c290bb4771bd188dbefa73 vs e8cd567167c29466544361d0e5ba361b68b96331:

1. frontend-app/src/layouts/DashboardLayout.tsx (stable data-testid only)
2. frontend-app/src/stores/dashboard-layout-store.ts (bounded Zustand layout state)

Harness/config also includes DR4-08 test-local Vitest aliases in frontend-app/vite.config.ts (not a production shim).
