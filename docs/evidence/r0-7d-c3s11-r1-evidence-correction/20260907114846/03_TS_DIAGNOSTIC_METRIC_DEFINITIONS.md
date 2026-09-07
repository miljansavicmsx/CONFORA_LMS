# TypeScript Diagnostic Metric Definitions

Command:
npm --prefix frontend-app run lint:all
which equals tsc -b --pretty false after any automated package ensure hooks present on the commit under test.

Signature format:
path|TScode|normalizedMessage

Normalization:

- collapse whitespace in message to single spaces
- replace workspace absolute roots with token ROOT
- normalize path separators to /

RAW_DIAGNOSTIC_COUNT:
total number of parsed TypeScript diagnostic occurrences matching:
path(line,col): error TScode: message

NORMALIZED_UNIQUE_SIGNATURE_COUNT:
number of unique path|TScode|normalizedMessage signatures

NORMALIZED_NEW_SIGNATURE_COUNT:
unique feature signatures absent from base

NORMALIZED_RESOLVED_SIGNATURE_COUNT:
unique base signatures absent from feature

TARGETED_C3S11_SPECIFIC / TARGETED_C3S11_RESOLVED:
signatures whose normalized message matches Cannot find module for @confora/i18n, @confora/i18n/react, or @confora/ui

Ambiguous field names such as FEATURE_TS_DIAGNOSTIC_COUNT without an explicit unit are retired in this correction package.
