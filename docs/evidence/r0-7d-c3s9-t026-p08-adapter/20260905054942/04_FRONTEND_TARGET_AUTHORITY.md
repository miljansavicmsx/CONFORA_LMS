# 04_FRONTEND_TARGET_AUTHORITY

TARGET=AdminReportsPage + AdminReportsGuard + reports-client + admin-reports-api/access
VIEWS=by-status, by-scheme-ref
NETWORK_OPS=2 GET
QUERY_KEYS=status,schemeRef,createdFrom,createdTo,submittedFrom,submittedTo
THRESHOLD=5
TENANT_SELECTOR=0
EXPORT=0
ROW_LEVEL=0
DERIVED_PERCENTAGES=0
POLLING=0
CLIENT_CACHE_PERSIST=0
RESULT_LOGGING=0
COMPATIBILITY=AdminDashboardSummary type retained for admin-gov-ux-labels (outside KEEP14 consumer)
