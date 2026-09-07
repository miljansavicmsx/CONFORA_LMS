# 16_BUILD_TESTS

SIGNATURE_METHOD=path|TScode|normalizedMessage

## Clean baseline (post-provision, pre-feature)
BASE_C01_lint: exit=1 diagnosticCount=157 affectedPathCount=50 errorCodeCount=16 signatureCount=125
BASE_C02_build: exit=1 diagnosticCount=157 affectedPathCount=50 errorCodeCount=16 signatureCount=125

## Feature
FEAT_C01_lint: exit=1 diagnosticCount=147 affectedPathCount=47 errorCodeCount=16 signatureCount=116
FEAT_C02_build: exit=1 diagnosticCount=147 affectedPathCount=47 errorCodeCount=16 signatureCount=116

CLASS_C_NEVER_CALLED_PASS=true
C03_API_TYPECHECK_EXIT=2 C03_TS_ERROR_MENTIONS≈43 EXPECTED_BASELINE

PROVISIONING:
P01=junction-ok trackedΔ0 (pnpm frozen via overnight node_modules junction)
P02=junction-ok lockfile ABSENT trackedΔ0
P03=prisma client present trackedΔ0 (generate Δ0; junction client)
P04=i18n dist present trackedΔ0
