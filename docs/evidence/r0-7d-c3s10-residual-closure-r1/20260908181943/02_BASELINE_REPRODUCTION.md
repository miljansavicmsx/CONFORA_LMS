# 02_BASELINE_REPRODUCTION

INTEGRATION_BASE_SHA = 8a7ff77a1d0e7c891bf99b1268c3dac48f9ff548

MD01_BASELINE_DEFECT_REPRODUCED = true
MD01_BASELINE_FACT = frontend-app/src/components/accessibility/LandmarkDevAudit.tsx ABSENT while App.tsx imports named export LandmarkDevAudit under import.meta.env.DEV

CSP_BASELINE_RESIDUAL_COUNT = 4
CSP_BASELINE_RESIDUAL_REPRODUCED_COUNT = 4

CSP-R01 = Default Report-Only (CSP_MODE ?? 'report-only') in frontend-app/vite-csp-preview.mjs — REPRODUCED at base
CSP-R02 = bare https: in connect-src in packages/config/csp/build-csp.mjs — REPRODUCED at base
CSP-R03 = unused NODE_ENV read while forcing isProd:true in frontend-app/vite-csp-preview.mjs — REPRODUCED at base
CSP-R04 = production style-src permits 'unsafe-inline' in packages/config/csp/build-csp.mjs — REPRODUCED at base

BASE_RAW_TS_DIAGNOSTIC_COUNT = 174
BASE_NORMALIZED_UNIQUE_TS_SIGNATURE_COUNT = 143
BASE_C3S10_SPECIFIC_TS_DIAGNOSTIC_COUNT = 1
BASE_C3S10_SPECIFIC_NOTE = App.tsx TS2307 missing LandmarkDevAudit module

BASE_RAW_BUILD_DIAGNOSTIC_COUNT = 174
BASE_NORMALIZED_UNIQUE_BUILD_SIGNATURE_COUNT = 143
BASE_C3S10_SPECIFIC_BUILD_DIAGNOSTIC_COUNT = 1
BUILD_COMPARATOR_METHOD = tsc -b --pretty false --force after @confora/ui and @confora/i18n package builds (same diagnostic family as lint:all core)
