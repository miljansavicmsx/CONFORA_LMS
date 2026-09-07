# Arithmetic And Non-Target Resolution Reconciliation

TS_RAW_COUNT_ARITHMETIC_RECONCILED = true
Raw: base 170 -> feature 145
Raw delta = 25

TS_NORMALIZED_SIGNATURE_ARITHMETIC_RECONCILED = true
Unique: base 139 -> feature 114
NORMALIZED_NEW_SIGNATURE_COUNT = 0
NORMALIZED_RESOLVED_SIGNATURE_COUNT = 25

C3S11_TARGETED_RESOLUTION_ARITHMETIC_RECONCILED = true
Targeted C3-S11: base-specific 24 -> feature-specific 0
CORRECTED_TARGETED_C3S11_RESOLVED_DIAGNOSTIC_COUNT = 24

OTHER_RESOLVED_PREEXISTING_SIGNATURE_COUNT = 1
OTHER_RESOLVED_PREEXISTING_SIGNATURES =
src/components/i18n/LanguageSwitcher.tsx|TS7006|Parameter 'locale' implicitly has an 'any' type.

Why that non-target signature resolved:
On base, @confora/i18n module resolution failed, so LanguageSwitcher locale callback typing collapsed and emitted TS7006 implicit any.
On feature source commit, GENERATE_BEFORE_CONSUME restores package dist/types before lint, so locale is typed and the TS7006 occurrence disappears.
Classification: benign incidental secondary effect of restoring module types.
PRODUCT_BEHAVIOR_DRIFT_FROM_THIS_SIGNATURE = false

Arithmetic check:
25 normalized resolved signatures = 24 targeted C3-S11 + 1 non-target incidental = 25.
