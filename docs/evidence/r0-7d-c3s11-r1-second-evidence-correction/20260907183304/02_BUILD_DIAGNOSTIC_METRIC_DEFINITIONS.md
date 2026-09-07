# Build Diagnostic Metric Definitions

Frozen build comparator command:
npm --prefix frontend-app run build
which equals tsc -b && vite build after any automated package ensure hooks present on the commit under test.

RAW_BUILD_DIAGNOSTIC_COUNT =
total parsed diagnostic occurrences emitted by the frozen build comparator command matching:
path(line,col): error TScode: message

NORMALIZED_UNIQUE_BUILD_SIGNATURE_COUNT =
unique count of path|TScode|normalizedMessage

normalized signature format:
path|TScode|normalizedMessage

Normalization:
- path separators forced to forward slash
- frontend-app absolute prefixes stripped to repo-relative frontend paths such as src/... or vite.config.ts
- absolute filesystem paths inside messages replaced with token ROOT
- internal whitespace collapsed

NEW_NORMALIZED_BUILD_SIGNATURE_COUNT =
normalized feature signatures absent from base

RESOLVED_NORMALIZED_BUILD_SIGNATURE_COUNT =
normalized base signatures absent from feature

BUILD_RAW_RESOLVED_OCCURRENCE_COUNT =
raw diagnostic occurrences present in base and absent in feature by normalized signature membership

Explicit unit separation:
147 and 145 are RAW counts.
116 and 114 are NORMALIZED UNIQUE counts.
They are not interchangeable.
Never report a unique count as a raw count.
