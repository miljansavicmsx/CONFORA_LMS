# Owner Decisions OD1 (16) — preserved

OD1-01 INTERNAL_TENANT_SCOPED_CERTIFICATION_APPLICATION_AGGREGATE_QUERY
OD1-02 READ_ONLY_INTERNAL_QUERY / ReportQuery domain / zero production routes
OD1-03 Exact four roles: STAFF_DIR | STAFF_SYSADM | STAFF_AUD | QUALITY_MANAGER
OD1-04 GroupBy dimensions locked: status | schemeRef
OD1-05 Filters: status, schemeRef, createdFrom/To, submittedFrom/To
OD1-06 At least one complete date pair required; max 365\*86400000 ms inclusive
OD1-07 Small-cell threshold 5; counts 1-4 suppressed without count property
OD1-08 STRATEGY_A_OMIT_TOTAL_WHEN_ANY_GROUP_IS_SUPPRESSED
OD1-09 TenantPrisma +count +groupByStatus +groupBySchemeRef only (no generic groupBy)
OD1-10 Raw Prisma allowlist delta 0 (remains 7)
OD1-11 Zero schema/migration/manifest/lockfile/frontend delta
OD1-12 Zero audit event/registry/append; no AuditService runtime dependency
OD1-13 Zero writes; no exports; no row-level dump
OD1-14 No BAR-P08 / T026 / C3-S9 intrusion
OD1-15 Disposable PostgreSQL pinned image mandatory for runtime proof
OD1-16 Successful R1 does not accept/integrate; advances to R2 final review only

No OD1 reopen. No new owner decision required for R1.
