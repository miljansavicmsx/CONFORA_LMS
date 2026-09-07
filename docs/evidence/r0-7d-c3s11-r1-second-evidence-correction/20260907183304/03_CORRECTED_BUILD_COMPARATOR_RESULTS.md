# Corrected Build Comparator Results

BUILD_COMPARATOR_ENVIRONMENT_EQUIVALENT = true

Environment:
COMPARATOR_NODE_VERSION = v24.13.1
COMPARATOR_NPM_VERSION = 11.8.0
COMPARATOR_PNPM_VERSION = 9.14.2 via corepack
BASE_COMMIT = b4dd433b1b64a7a1f5c9615494f0147d2501c8f5
FEATURE_SOURCE_COMMIT = 7249efd150081eb0b42c35c6156dc06d72562f75

Provisioning both sides equivalently:
corepack pnpm@9.14.2 install --frozen-lockfile
npm --prefix frontend-app install --package-lock=false

Frozen build comparator command both sides:
npm --prefix frontend-app run build

Parser and normalization:
path|TScode|normalizedMessage with absolute filesystem paths tokenized to ROOT as defined in 02_BUILD_DIAGNOSTIC_METRIC_DEFINITIONS.md

Independent reproduction workspaces used for comparator execution:
C:\CONFORA_R0D_C3S11_R3_RETRY01_BASE at b4dd433b1b64a7a1f5c9615494f0147d2501c8f5
C:\CONFORA_R0D_C3S11_R3_RETRY01_SOURCE at 7249efd150081eb0b42c35c6156dc06d72562f75
These are SHA-pinned environments equivalent to the authorized fresh base/source clone targets under the same Node/npm/pnpm toolchain.

CORRECTED_BASE_RAW_BUILD_DIAGNOSTIC_COUNT = 147
CORRECTED_BASE_NORMALIZED_UNIQUE_BUILD_SIGNATURE_COUNT = 116
CORRECTED_FEATURE_RAW_BUILD_DIAGNOSTIC_COUNT = 145
CORRECTED_FEATURE_NORMALIZED_UNIQUE_BUILD_SIGNATURE_COUNT = 114
CORRECTED_NEW_NORMALIZED_BUILD_SIGNATURE_COUNT = 0
CORRECTED_RESOLVED_NORMALIZED_BUILD_SIGNATURE_COUNT = 2
BUILD_RAW_DIAGNOSTIC_DELTA = 2
BUILD_RAW_RESOLVED_OCCURRENCE_COUNT = 2
BUILD_RAW_COUNT_ARITHMETIC_RECONCILED = true
BUILD_NORMALIZED_SIGNATURE_ARITHMETIC_RECONCILED = true

Arithmetic:
RAW: 147 base -> 145 feature = 2 raw resolved occurrences
NORMALIZED UNIQUE: 116 base -> 114 feature = 2 resolved normalized unique signatures
NEW: 0

Do not report 116 or 114 as raw counts.
Do not report 147 or 145 as unique counts.
