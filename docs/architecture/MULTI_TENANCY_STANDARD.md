# CONFORA Multi-Tenancy Standard

| Field | Value |
|-------|-------|
| **Document ID** | CON-ARCH-TENANCY-001 |
| **Status** | Normative architecture (R0-1B2.1) |
| **Date** | 2026-07-26 |
| **Authority** | Subordinate to owner decisions and Baseline |
| **OQ-7** | Remains **OPEN** |

This standard defines **architectural requirements**. It does **not** claim that controls are fully implemented or independently verified on a clean clone.

## Control record template

Each control below uses:

| Field | Meaning |
|-------|---------|
| Architectural requirement | What must be true |
| Repository implementation evidence | What exists in tracked tree today |
| Verification status | UNVERIFIED / PARTIAL / VERIFIED |
| Known bypass | Documented bypass risk |
| Residual gap | What remains |
| Remediation owner | Who drives closure |
| Exit criteria | When the gap may close |

---

## 1. Tenant context creation

| Field | Value |
|-------|-------|
| Architectural requirement | Every authenticated request establishes a tenant context from trusted server-side identity claims |
| Repository implementation evidence | Partial Nest auth helpers tracked under pps/api/src/auth/; full TenantModule not in tracked file list |
| Verification status | PARTIAL |
| Known bypass | Client-supplied tenant IDs without server validation |
| Residual gap | End-to-end context factory not confirmed on clean clone |
| Remediation owner | Backend / Security (OQ-7) |
| Exit criteria | Tracked module + negative tests on clean clone |

## 2. Server-side tenant enforcement

| Field | Value |
|-------|-------|
| Architectural requirement | Authorization and data access enforce tenant boundaries server-side |
| Repository implementation evidence | pps/api/src/prisma/tenant-access-violation.filter.ts tracked |
| Verification status | PARTIAL |
| Known bypass | Handlers that skip guards; dual FastAPI local paths if used |
| Residual gap | API-wide coverage matrix not proven on tracked tree |
| Remediation owner | Backend (OQ-7) |
| Exit criteria | Route enforcement matrix + failing cross-tenant tests turning green on CI |

## 3. Prisma tenant fields

| Field | Value |
|-------|-------|
| Architectural requirement | Business-critical entities include 	enant_id (or approved equivalent) |
| Repository implementation evidence | packages/database has **0** tracked files; schema SoT absent on clean clone |
| Verification status | UNVERIFIED on clean clone |
| Known bypass | Models without tenant column; unchecked raw queries |
| Residual gap | Tracked Prisma schema + migrations required |
| Remediation owner | Data |
| Exit criteria | Tracked schema with tenant fields + migration evidence |

## 4. Raw SQL

| Field | Value |
|-------|-------|
| Architectural requirement | Raw SQL must include explicit tenant predicates or be platform-scoped with audit |
| Repository implementation evidence | Not comprehensively inventoried in R0-1B2.1 tracked tree |
| Verification status | UNVERIFIED |
| Known bypass | Raw queries omitting tenant filters |
| Residual gap | Inventory + lint/review gates |
| Remediation owner | Backend / Security |
| Exit criteria | Inventory closed; policy tests |

## 5. Platform-scope operations

| Field | Value |
|-------|-------|
| Architectural requirement | Platform-scope actions are explicit, least-privilege, and audited |
| Repository implementation evidence | packages/shared-kernel tenant helpers include platform-scope concepts (tracked) |
| Verification status | PARTIAL |
| Known bypass | Over-broad platform roles |
| Residual gap | Allowlist + audit coverage proof |
| Remediation owner | Security |
| Exit criteria | Documented allowlist + audit samples |

## 6. Background jobs

| Field | Value |
|-------|-------|
| Architectural requirement | Jobs propagate tenant context; no silent cross-tenant processing |
| Repository implementation evidence | pps/worker has **0** tracked files |
| Verification status | UNVERIFIED |
| Known bypass | Job payloads without tenant |
| Residual gap | Tracked worker + tests |
| Remediation owner | Backend |
| Exit criteria | Tracked worker with tenant tests |

## 7. Audit association

| Field | Value |
|-------|-------|
| Architectural requirement | Audit events carry tenant association (or explicit platform scope) |
| Repository implementation evidence | packages/audit-client tracked; ledger service incomplete on clean clone |
| Verification status | PARTIAL |
| Known bypass | Events missing tenant fields |
| Residual gap | OQ-7 ledger completeness |
| Remediation owner | Platform |
| Exit criteria | Ledger schema tracked + integrity tests |

## 8. Cache and storage keys

| Field | Value |
|-------|-------|
| Architectural requirement | Cache/object keys are tenant-prefixed (or equivalent isolation) |
| Repository implementation evidence | Not verified in R0-1B2.1 tracked tree |
| Verification status | UNVERIFIED |
| Known bypass | Global keys |
| Residual gap | Standard + tests |
| Remediation owner | Backend |
| Exit criteria | Key policy tests |

## 9. Cross-tenant tests

| Field | Value |
|-------|-------|
| Architectural requirement | Automated negative tests prove cross-tenant denial |
| Repository implementation evidence | Limited e2e specs tracked under pps/api/test/; not a full suite proof |
| Verification status | PARTIAL |
| Known bypass | Tests skipped in broken CI (R0-7) |
| Residual gap | Green CI on clean clone |
| Remediation owner | QA / Backend |
| Exit criteria | R0-7 + tenant test pack PASS |

## 10. RLS or equivalent database protection

| Field | Value |
|-------|-------|
| Architectural requirement | Database-enforced tenant protection (RLS or equivalent) where required by Baseline |
| Repository implementation evidence | No tracked migrations under packages/database |
| Verification status | UNVERIFIED |
| Known bypass | App-only filters |
| Residual gap | Tracked SQL policies + tests |
| Remediation owner | Data |
| Exit criteria | Tracked RLS/equivalent + verification |

## 11. Migration and backfill obligations

| Field | Value |
|-------|-------|
| Architectural requirement | Schema changes preserve tenant integrity; backfills are audited |
| Repository implementation evidence | Absent tracked database package |
| Verification status | UNVERIFIED |
| Known bypass | Untested backfills |
| Residual gap | Migration playbooks |
| Remediation owner | Data |
| Exit criteria | Playbook + evidence pack |

---

## Non-claims

- Complete tenant isolation is **not** claimed.
- Complete RLS is **not** claimed.
- OQ-7 remains **OPEN**.
