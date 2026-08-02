# Browser accessibility analysis

## Workflow-intended path (unavailable)

- `tests/e2e` has 0 tracked files
- Chromium via Playwright; URLs on 127.0.0.1 (good ephemeral posture)
- Auth/demo seed depends on FastAPI/Dynamo compose (legacy vs frontend-app-only)
- Production URLs not used

## Tracked alternative

- `frontend-app/playwright.config.ts` + tracked e2e acceptance specs
- No tracked axe-core gate identified by name
- Prefer `vite preview` after tracked build

Inference: recover via minimal tracked frontend-app axe smoke, not full tests/e2e promotion.
