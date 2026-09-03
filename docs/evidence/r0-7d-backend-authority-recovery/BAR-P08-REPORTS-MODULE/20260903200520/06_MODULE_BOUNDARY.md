# Module Boundary

P08_MISSION=THIN_HTTP_AUTHORITY_ADAPTER_OVER_BAR_P07_REPORT_QUERY

ReportsModule:

- imports ReportQueryModule
- controllers: ReportsController (count=1)
- providers: ReportsRolesGuard, ReportQueryContractFilter

ReportsController:

- depends on ReportQueryService only
- no PrismaService / TenantPrismaService / AuditService

ReportQueryModule:

- remains controller-free (controllers=[])

P08_PRODUCTION_CONTROLLER_COUNT=1
REPORT_QUERY_MODULE_CONTROLLER_COUNT=0
REPORT_QUERY_PUBLIC_OPERATION_COUNT=unchanged_P07_service_surface
REPORTS_CONTROLLER_DIRECT_DATABASE_DEPENDENCY_COUNT=0
