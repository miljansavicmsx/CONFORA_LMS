# Clean Clone Baseline Reproduction

CLONE_HEAD = b4dd433b1b64a7a1f5c9615494f0147d2501c8f5
PORCELAIN_COUNT = 0

MD15_PATH_PRESENT_AFTER_CLONE = false
MD15_TRACKED = false
MD15_IGNORED = true
MD15_IGNORE_RULE = .gitignore:58:packages/\*\*/dist/

MD16_PATH_PRESENT_AFTER_CLONE = false
MD16_TRACKED = false
MD16_IGNORED = true

MD17_PATH_PRESENT_AFTER_CLONE = false
MD17_TRACKED = false
MD17_IGNORED = true

BASE_CLEAN_CLONE_INSTALL_RESULT = PASS
AFTER_PNPM_INSTALL_DIST_PRESENT = false
AFTER_FRONTEND_NPM_INSTALL_DIST_PRESENT = false

BASE_FRONTEND_LINT_COMMAND = npm --prefix frontend-app run lint:all
BASE_FRONTEND_LINT_RESULT = FAIL
BASE_C3S11_SPECIFIC_DIAGNOSTIC_COUNT = 24
BASE_TS_DIAGNOSTIC_COUNT = 170

C3S11_BASELINE_DEFECT_REPRODUCED = true

Representative signatures:

- src/main.tsx|TS2307|Cannot find module @confora/i18n/react
- src/App.tsx|TS2307|Cannot find module @confora/i18n/react
- multiple production/test files|TS2307|Cannot find module @confora/i18n
- src/layouts/DashboardLayout.tsx|TS2307|Cannot find module @confora/ui

BASE_UI_BUILD_VIA_NPM_RESULT = FAIL
BASE_UI_BUILD_FAILURE_REASON = nested build script invoked bare pnpm which is absent from PATH under npm run
BASE_I18N_BUILD_RESULT = PASS when UI types already resolvable
