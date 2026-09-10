# 03 Historical R1 Evidence Defects Superseded

HISTORICAL_R1_EVIDENCE_ROOT = docs/evidence/r0-7d-c3s10-residual-closure-r1/20260908181943/
HISTORICAL_R1_EVIDENCE_CHANGED_PATH_COUNT = 0

HISTORICAL_EVIDENCE_DEFECT_COUNT = 3
HISTORICAL_EVIDENCE_DEFECTS_EXPLICITLY_SUPERSEDED_COUNT = 3

EVID-F01 SUPERSEDED: Historical claimed 3/3 PASS for npm --prefix frontend-app exec vitest; R2 reproduced 1/3. Corrected commands CMD-01..CMD-04 use npm --prefix frontend-app run test -- and Playwright smoke. Clean-clone results: CMD01 6/6 PASS, CMD02 5/5 PASS, CMD03 4/4 PASS, CMD04 2/2 PASS.

EVID-F02 SUPERSEDED: Historical R1 comparator claimed base raw174/unique143; R2 environment-equivalent authority is base raw145/unique114 and feature raw144/unique113 with resolved LandmarkDevAudit TS2307. Remediation comparator on same machine: feature rem raw144/unique113; NEW_UNCLASSIFIED_TS_REGRESSION_COUNT = 0; NEW_UNCLASSIFIED_BUILD_REGRESSION_COUNT = 0.

EVID-F03 SUPERSEDED: Historical claimed CSP production regression 0; R2 found entry-script and DashboardLayout inline-style runtime incompatibilities. Both closed by vite-csp-preview HTML nonce rewrite and class-based DashboardLayout spacing; browser smoke PASS with 0 material CSP violations.
