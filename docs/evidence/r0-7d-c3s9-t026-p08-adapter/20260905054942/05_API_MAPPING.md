# 05_API_MAPPING

GET /v1/staff/reports/certification-applications/by-status
GET /v1/staff/reports/certification-applications/by-scheme-ref
DATE_TRANSPORT=RFC3339 OPTIONAL_1_TO_3_DIGITS via calendarDateToP08DayStartUtc/EndUtc
FORBIDDEN_QUERY_KEYS=tenantId,organizationId,reportType,groupBy,dateFrom,dateTo,limit,offset,page,pageSize
ERROR_SURFACING=normalizeApiError (400/401/403/429/500/network)
BACKEND_CODE_DELTA=0
