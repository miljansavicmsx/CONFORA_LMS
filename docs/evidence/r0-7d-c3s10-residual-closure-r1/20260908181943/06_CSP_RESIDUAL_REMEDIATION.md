# 06_CSP_RESIDUAL_REMEDIATION

CSP_RESIDUAL_COUNT = 4
CSP_RESIDUAL_REPRODUCED_COUNT = 4
CSP_RESIDUAL_IMPLEMENTED_COUNT = 4
CSP_RESIDUAL_VALIDATED_COUNT = 4

CSP-R01 = Default Report-Only (CSP_MODE ?? 'report-only') → remediates to CSP_MODE ?? 'enforce'
PATH = frontend-app/vite-csp-preview.mjs
RESULT = PASS
PASS_CRITERION = default mode enforce; report-only only when CSP_MODE explicitly set

CSP-R02 = bare https: in connect-src
PATH = packages/config/csp/build-csp.mjs
RESULT = PASS
PASS_CRITERION = connect-src is 'self' + explicit apiOrigin only

CSP-R03 = unused NODE_ENV read while forcing isProd:true
PATH = frontend-app/vite-csp-preview.mjs
RESULT = PASS
PASS_CRITERION = no process.env.NODE_ENV; isProd:true remains forced

CSP-R04 = production style-src permits 'unsafe-inline'
PATH = packages/config/csp/build-csp.mjs
RESULT = PASS
PASS_CRITERION = prod style-src is 'self' + nonce only

CSP_SECURITY_WEAKENING_COUNT = 0
CSP_PRODUCTION_BEHAVIOR_REGRESSION_COUNT = 0
CSP_PREVIEW_PRODUCTION_BOUNDARY_VALID = true
NOTE = plugin remains configurePreviewServer only; no configureServer / transformIndexHtml
