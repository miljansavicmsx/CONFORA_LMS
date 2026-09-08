# 05 Full Vite Build

Command (correct working directory = frontend-app):
npx vite build

FULL_VITE_BUILD_RESULT = FAIL_NONZERO_PRE_EXISTING_CSS_DEBT
FULL_VITE_BUILD_PRE_EXISTING_CSS_FAILURE_COUNT = 1
FULL_VITE_BUILD_NEW_REMEDIATION_FAILURE_COUNT = 0
FULL_BUILD_EVIDENCE_ACCURATE = true

Exact failure (frontend-app/src/index.css):
@layer base is used but no matching @tailwind base directive is present.

Artifact: 16_FULL_VITE_BUILD_FRONTEND_APP_CWD.log
This is NOT a wrong-directory missing index.html failure.
Unrelated Tailwind/PostCSS debt was not fixed in this bounded package.
