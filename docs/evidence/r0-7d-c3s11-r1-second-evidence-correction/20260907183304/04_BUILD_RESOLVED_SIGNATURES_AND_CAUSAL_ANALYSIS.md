# Build Resolved Signatures And Causal Analysis

CORRECTED_BUILD_RESOLVED_SIGNATURE_COUNT = 2
NEW_BUILD_REGRESSION_COUNT = 0
NEW_NORMALIZED_BUILD_SIGNATURE_COUNT = 0

## Resolved signature 1

PATH = src/components/i18n/__tests__/language-switcher.test.tsx
TS_CODE = TS2322
NORMALIZED_MESSAGE = Type 'string' is not assignable to type '"en" | "bs" | "sr" | "hr" | "sl" | undefined'.
BASE_PRESENCE = present
FEATURE_ABSENCE = absent
CAUSE = Test helper renderWithI18n(ui, lng = "en") passes a string-typed default parameter into createConforaI18n({ lng, fallbackLng: "en" }). On base, CreateConforaI18nOptions typed lng/fallbackLng as SupportedLocale, so the string parameter produced TS2322. Feature commit 7249efd150081eb0b42c35c6156dc06d72562f75 widens CreateConforaI18nOptions.lng and fallbackLng to string while retaining runtime isSupportedLocale validation and SupportedLocale fallback. The call site becomes type-compatible; the diagnostic disappears.
CAUSED_BY_INTENDED_CREATE_I18N_TYPE_WIDENING = true
RUNTIME_SEMANTICS_CHANGED = false
PUBLIC_API_BREAK = false
PRODUCT_BEHAVIOR_CHANGED = false
CLASSIFICATION = benign
PRODUCT_DRIFT = false

## Resolved signature 2

PATH = src/components/layout/__tests__/td-070-f2-i18n.test.tsx
TS_CODE = TS2322
NORMALIZED_MESSAGE = Type 'string' is not assignable to type '"en" | "bs" | "sr" | "hr" | "sl" | undefined'.
BASE_PRESENCE = present
FEATURE_ABSENCE = absent
CAUSE = Identical helper pattern: renderWithI18n(ui, lng = "en") supplies string into createConforaI18n options. Same base SupportedLocale option typing produced TS2322; same feature option widening removes it. Runtime still validates and falls back unsupported locales.
CAUSED_BY_INTENDED_CREATE_I18N_TYPE_WIDENING = true
RUNTIME_SEMANTICS_CHANGED = false
PUBLIC_API_BREAK = false
PRODUCT_BEHAVIOR_CHANGED = false
CLASSIFICATION = benign
PRODUCT_DRIFT = false

## Reconciliation

BUILD_RAW_DIAGNOSTIC_DELTA = 2
BUILD_RAW_RESOLVED_OCCURRENCE_COUNT = 2
RESOLVED_NORMALIZED_BUILD_SIGNATURE_COUNT = 2
NEW_NORMALIZED_BUILD_SIGNATURE_COUNT = 0
BUILD_DELTA_CAUSE_REPRODUCED = true
BUILD_DELTA_CAUSE = Feature create-i18n option-type widening (SupportedLocale -> string for lng/fallbackLng) removes exactly the two test-helper TS2322 signatures above; zero new normalized build signatures appear.
BUILD_RESOLVED_SIGNATURE_1_CAUSE_EXPLAINED = true
BUILD_RESOLVED_SIGNATURE_2_CAUSE_EXPLAINED = true
BUILD_RESOLUTIONS_BENIGN = true
BUILD_RESOLVED_SIGNATURES_BENIGN = true
BUILD_RESOLUTION_PRODUCT_BEHAVIOR_DRIFT = false
BUILD_RESOLVED_SIGNATURES_PRODUCT_BEHAVIOR_DRIFT = false
CREATE_I18N_RUNTIME_BEHAVIOR_REGRESSION_COUNT = 0
PUBLIC_EXPORT_REMOVAL_COUNT = 0
PUBLIC_EXPORT_BREAKING_CHANGE_COUNT = 0
