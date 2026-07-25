# CONFORA REPO HEALTH 44 — Remaining Package Classification

## Classes used

CLOSED · SAFE_AUDIT_NEXT · REVIEW_REQUIRED · REWORK_REQUIRED · DEFER · DO_NOT_IMPORT

## Remaining package roots

| Path | Classification | Rationale |
|------|----------------|-----------|
| `packages/ai-client` | **SAFE_AUDIT_NEXT** | Real source; purpose schema vs closed prompts; gateway client only — audit before any import |
| `packages/database` | **REVIEW_REQUIRED** | Prisma/migrations/seed; authz/tenant/data plane — full architecture review before import |
| `packages/ai-governance` | **DEFER** | README stub only |
| `packages/audit` | **DEFER** | README stub; live path is audit-client |
| `packages/auth` | **DEFER** | README stub; high-risk domain when filled |
| `packages/types` | **DEFER** | README stub; live path is shared-types |

## Other classifications

| Item | Class |
|------|-------|
| HR MJML ×3 | **DEFER** |
| RH43 apps/api AI rework | **DEFER** / blocked |
| `apps/api/dist`, `coverage`, nm, turbo | **DO_NOT_IMPORT** |
| Wholesale untracked `apps/*`, `frontend-*`, `terraform`, `backend` | **DO_NOT_IMPORT** without controlled evidence |
| Closed nine packages | **CLOSED** |

## REWORK_REQUIRED (packages)

**None** at package level while apps/api AI source is missing. Prior RH42 rework targets are not actionable (RH43A).

## High-risk areas (remaining)

- Auth/RBAC (stub `packages/auth` + apps/api auth slice + untracked apps)
- Audit ledger (stub `packages/audit`; closed `audit-client`)
- Database/migrations (`packages/database`)
- AI client/provider coupling (`packages/ai-client` + stale apps/api dist)
- AI governance (`packages/ai-governance` stub)
- Generated/stale artifacts
