# CA-H01 audit:f4-frontend-api Result

## Before (F5-7 baseline)

| Field | Value |
|-------|-------|
| Evidence | docs/evidence/f4-8f-legacy-api-usage-audit/2026-07-05T07-42-11/ |
| Verdict | NO-GO |
| Failing path references | 12 (7 BLOCKED + 5 LEGACY_MUTATION + 7 EXPORT_BYPASS unique paths) |

## After (CA-H01 fix)

| Field | Value |
|-------|-------|
| Pass | true |
| Exit code | 0 |
| Gate failures | 0 |

```

> confora@0.0.0 audit:f4-frontend-api
> node scripts/ops/audit-f4-frontend-api-usage.mjs

F4-8f Legacy API Usage Audit Gate
Timestamp: 2026-07-05T07-56-02
Verdict: GO
Roots scanned: frontend-app, apps-web, apps-admin, packages
Skipped roots: (none)

Total hits (incl. tests): 89
Production API hits: 26
Fallback-only hits: 12
Canonical production hits: 11
Legacy production hits: 6
F4 FastAPI production hits: 0
Blocked production hits: 0
Legacy mutation production hits: 0
Export bypass violations: 0
Unknown production hits: 9
Env var hits: 7
Undocumented mutations (non-F4 allowlist): 0
Missing required canonical: 0
Endpoint registry issues: 0
F4 client auth/data issues: 0
Gate failures: 0

PASS: all F4-8f gate checks satisfied.

Evidence: docs/evidence/f4-8f-legacy-api-usage-audit/2026-07-05T07-56-02

GO: F4-8f Legacy API Usage Audit Gate passed.

```
