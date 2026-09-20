# Deferrals and disclaimers

## Education cluster (MD02, MD03, MD10)

EDUCATION_CLUSTER_MD02_MD03_MD10_STATUS =
DEFERRED_PENDING_AD1C_AND_VERIFIABLE_IDENTITY_AUTHORITY

AD1C_STATUS = STOPPED_BLOCKED (HD06 record)

Freezing PRIMARY_PATH for MD02/MD03/MD10 does not lift this deferral.
Implementation of EducationCharts, admin-education-api, or
AdminEducationGuard remains unauthorized until AD1C and verifiable
identity authority are separately granted.

## HD06 vs MD06

HD06_DECISION = KEEP_DEFERRED
HD06_BINDING_APPROVED = false
DEJANA_ACCOUNT_BINDING_VERIFIED = false
MD06_IS_NOT_HD06 = true
MD06_PRIMARY_PATH = frontend-app/src/pages/admin/IdentityReviewPage.tsx

HD06 remains Dejana Taušan account binding. Restoring or reviewing
IdentityReviewPage is not HD06 approval, DPO mandate effectiveness, or
04B electronic attestation.

## HD07 vs MD07

HD07_READY = false
HD07_AUTHENTICATION_CONTROL_VERIFICATION_READY = false
MD07_IS_NOT_HD07 = true
MD07_PRIMARY_PATH = frontend-app/src/pages/dashboard/IdentityReviewGuard.tsx

HD07 remains authentication-control verification readiness. Restoring
IdentityReviewGuard is not HD07_READY = true.

## Manual identity review panel

MANUAL_IDENTITY_REVIEW_PANEL_STATUS =
OUTSIDE_PROSPECTIVE_MODEL_D_EIGHT_PATH_FREEZE

PATH = frontend-app/src/components/admin/ManualIdentityReviewPanel.tsx

This file is not a PRIMARY_PATH or ADDITIONAL_PATH in this freeze.

## Additional paths

ADDITIONAL_PATH_COUNT = 0
No frozen item covers more than one path.
