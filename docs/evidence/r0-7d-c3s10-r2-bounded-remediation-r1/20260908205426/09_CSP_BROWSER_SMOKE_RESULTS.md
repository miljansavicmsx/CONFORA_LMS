# 09 CSP Browser Smoke Results

CSP_BROWSER_SMOKE_REQUIRED = true
CSP_BROWSER_SMOKE_RESULT = PASS
CSP_BROWSER_SMOKE_COMMAND = PLAYWRIGHT_NO_WEB_SERVER=1 npx playwright test e2e/csp-preview-enforce-smoke.spec.ts
CSP_BROWSER_CONSOLE_VIOLATION_COUNT = 0
CSP_BROWSER_MATERIAL_REQUIRED_RESOURCE_BLOCK_COUNT = 0

Note: Full production vite build remains blocked by pre-existing Tailwind/PostCSS debt outside remediation envelope. Smoke uses minimal dist served by vite preview so cspPreviewPlugin middleware is exercised under enforce mode.
CSP_PREVIEW_PRODUCTION_BOUNDARY_VALID = true
