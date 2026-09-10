# 05 Targeted Command Contract Corrected

HISTORICAL_TARGETED_COMMAND_AUTHORITY_CLASS = GOVERNANCE_VALIDATION_CONTRACT_CORRECTABLE
CORRECTED_TARGETED_COMMAND_COUNT = 4

CMD-01 = npm --prefix frontend-app run test -- src/test/**tests**/landmark-dev-audit.residual.test.ts
CMD-02 = npm --prefix frontend-app run test -- src/test/**tests**/vite-csp-preview.bootstrap.test.ts
CMD-03 = npm --prefix frontend-app run test -- src/test/**tests**/vitest-setup.bootstrap.test.ts
CMD-04 = PLAYWRIGHT_NO_WEB_SERVER=1 CSP_PREVIEW_SMOKE_PORT=4173 npx playwright test e2e/csp-preview-enforce-smoke.spec.ts (from frontend-app; self-starts vite preview with minimal dist fixture exercising cspPreviewPlugin)

MANUAL_NODE_MODULES_REPAIR_PERFORMED = false
PACKAGE_SCRIPT_CHANGE = false
