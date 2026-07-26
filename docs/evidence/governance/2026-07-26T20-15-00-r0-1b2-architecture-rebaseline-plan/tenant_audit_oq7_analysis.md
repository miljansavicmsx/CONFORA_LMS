# Tenant isolation and audit architecture (OQ-7)

**Status preserved:** OQ-7 remains **OPEN** (partially verified). Do not convert requirements into implementation claims.

## Sources

| Source | Tracked | Role |
|--------|---------|------|
| docs/MULTI_TENANCY_STANDARD.md | No | Candidate architecture standard (self-declared authoritative) |
| docs/architecture/decisions/ADR-007-audit-architecture.md | No | Append-only ledger decision |
| Baseline §0.4 / OQ-7 | Yes | Partial verification acknowledgement |
| Tracked tenant helpers in pps/api | Yes (2 files) | Implementation fragments only |

## Distinction table

| Topic | Architectural requirement | Implemented control (observed) | Verified control | Unresolved gap |
|-------|---------------------------|--------------------------------|------------------|----------------|
| 	enant_id on core entities | Mandatory (MULTI_TENANCY_STANDARD, ADR-003) | Unknown on clean clone — packages/database **0 tracked** | Not verified | Schema promotion + migration evidence |
| Tenant context on requests | Required | Tracked filter/extension fragments only; full TenantModule not tracked | Not verified on clean clone | OQ-7 |
| Tenant guard coverage | Required | Cannot assert API-wide coverage from 20 tracked files | Not verified | Needs matrix against routes |
| Prisma tenant fields | Required | packages/database untracked | Not verified | Track schema under change control |
| Raw SQL bypass risk | Must be controlled | Not assessed in this planning task beyond noting risk class | Unresolved | Security review task |
| Platform-scope exceptions | Allowed with audit | Documented as concept in standard | Unresolved | Explicit allowlist evidence |
| Audit ledger append-only | Required (ADR-007, Baseline) | packages/audit 0 tracked; udit-client tracked name exists | Partial / not clean-clone proven | OQ-7 |
| Audit redaction | Required for sensitive fields | Not verified here | Unresolved | Dedicated audit review |
| RLS or equivalent | Standard/registry mention | Not verified on tracked migrations (none under packages/database) | Unresolved | OQ-7 |
| Kafka audit fan-out | ADR-007 claim | Contradicts Baseline RabbitMQ MVP | N/A | C-03 |

## Classification of MULTI_TENANCY_STANDARD for R0-1B2

PROMOTE_WITH_REBASELINE → docs/architecture/MULTI_TENANCY_STANDARD.md

Must demote self-declared "Authoritative — non-negotiable" to an architecture standard **subordinate** to owner decisions and Baseline, and rewrite "current gap" claims only where re-verified.
