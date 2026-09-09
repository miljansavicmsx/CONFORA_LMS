# 06 Runtime Harness Boundary

Real component: frontend-app/src/layouts/DashboardLayout.tsx
Store: frontend-app/src/stores/dashboard-layout-store.ts
Mocks: Header, Sidebar (child boundaries); tooltip/WorkspaceContext/jwt/permissions via test-local stubs/aliases
Providers: MemoryRouter; WorkspaceProvider from stub when wrapping DashboardLayout
createElement children passed in props (TS2769 defect fixed)
