# APPEALS-COMPLAINTS-FINAL — RBAC, Privacy, Tenant

## RBAC

| Control | Posture | Evidence |
|---------|---------|----------|
| Learner access to learner intake | Allowed (own cases) | 1, 1R |
| Learner access to staff route | **Denied** (`StaffAppealsComplaintsGuard` → `/unauthorized`) | 2, 2R |
| Staff access allow-list | `sys_admin`, `director`, committee/admin roles, etc. (see `staff-appeals-complaints-access.ts`) | 2 |
| Staff browser confirmation | `pilot.sysadmin@confora.test` (`sys_admin`) on local Nest login | 2R |
| Staff RBAC preserved | true | 2, 2R |
| Learner denied staff route | true | 2R |

## Tenant isolation

| Flag | Value |
|------|-------|
| `tenant_isolation_preserved` | true (all GO slices) |
| Learner own-cases-only | true (slice 1) |

No evidence of cross-tenant queue exposure in these slices. Broader multi-tenant hard-proof remains a platform concern outside this rollup’s new claims.

## Privacy

| Flag | Value |
|------|-------|
| `privacy_weakened` | false |
| Secrets / tokens / passwords in evidence commits | false (per summaries) |
| Staff/learner passwords | Env-only for Playwright (`PLAYWRIGHT_PILOT_PASSWORD`); no hardcoded fallbacks in 2R helper path |

## Encoding / enums

| Flag | Value |
|------|-------|
| `raw_enums_visible` | false |
| `encoding_issues_found` | false (canonical 1R and 2R PASS runs) |
