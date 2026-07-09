# TD-083 Privacy & RBAC Results

**Date:** 2026-07-09

## RBAC negative matrix

| Actor | Endpoint | Expected | Observed | Status |
|-------|----------|----------|----------|--------|
| Anonymous | `GET /v1/me/certificates` | 401 | 401 | PASS |
| `pilot.no-tenant@confora.test` | `GET /v1/me/certificates` | 403 | 403 | PASS |
| `pilot.wrong-tenant@confora.test` | `GET /v1/me/certificates` | 403 (not 500) | 403 | PASS |
| `pilot.learner@confora.test` | `GET /v1/me/certificates` | no learner2 cert | items=0, no CON-PILOT-000082 | PASS |
| `pilot.learner2@confora.test` | `GET /v1/me/certificates` | own certs only | payload clean | PASS |

## Privacy checks

| Check | Status |
|-------|--------|
| Wrong-tenant sees zero default-tenant certificates | PASS |
| No CON-PILOT-000082 leakage to wrong-tenant or other candidate | PASS |
| Wallet payload free of forbidden keys (tenantId, pdfStorageKey, nationalId, committee, etc.) | PASS |
| Public verify exposes no JMBG, DOB, email, identity evidence, reviewer notes, committee votes, audit payloads, storage paths | PASS |

## Boundaries preserved

| Control | Weakened? |
|---------|-----------|
| RBAC | false |
| Tenant isolation | false |
| Privacy / PII minimization | false |
| Public verification read-only | false |
| Audit trail | unchanged |
| Prisma schema | unchanged |
| Migrations | unchanged |

## Admin/Gov regression

`ops:admin-gov-final-acceptance-1` — **ADMIN_GOV_FINAL_ACCEPTANCE_GO** (15/15 screens, rbac_tenant_status PASS).
