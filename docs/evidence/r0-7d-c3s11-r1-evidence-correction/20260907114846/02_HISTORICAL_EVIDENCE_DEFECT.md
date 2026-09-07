# Historical Evidence Defect

HISTORICAL_R1_EVIDENCE_ROOT = docs/evidence/r0-7d-c3s11-mb-b-clean-clone-closure/20260907104406/
HISTORICAL_R1_EVIDENCE_FILE_COUNT = 15
HISTORICAL_DEFECT_FILE = docs/evidence/r0-7d-c3s11-mb-b-clean-clone-closure/20260907104406/10_TYPESCRIPT_BUILD_BASELINE_COMPARATOR.md

HISTORICAL_FEATURE_TS_DIAGNOSTIC_COUNT_RECORDED = 114
R1_EVIDENCE_DIAGNOSTIC_COUNT_DEFECT_REPRODUCED = true

Why incorrect:
The field FEATURE_TS_DIAGNOSTIC_COUNT was recorded as 114.
Independent reproduction shows that 114 equals FEATURE_NORMALIZED_UNIQUE_SIGNATURE_COUNT.
The corresponding FEATURE_RAW_TS_DIAGNOSTIC_COUNT is 145.
The historical note admits unique counts were used for delta gates, but the primary field name FEATURE_TS_DIAGNOSTIC_COUNT still presented 114 as if it were the raw diagnostic count parallel to BASE_TS_DIAGNOSTIC_COUNT=170 (which is raw).

Historical evidence remains immutable.
HISTORICAL_R1_EVIDENCE_CHANGED_PATH_COUNT = 0
This package does not edit the historical comparator file in place.
