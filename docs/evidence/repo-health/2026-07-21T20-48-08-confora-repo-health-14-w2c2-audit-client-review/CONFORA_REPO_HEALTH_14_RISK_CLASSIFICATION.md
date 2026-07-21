# CONFORA-REPO-HEALTH-14 — Risk classification

| Path | Class | Notes |
|------|-------|-------|
| `packages/audit-client/src/index.ts` | **review before import** → include in W2C-2 | Audit append Zod schema (action, actorId, tenantId, tenantScoped, platformScope, AI disclosure fields). Transport uses optional `getAccessToken` → `Authorization: Bearer <injected>` — **no hardcoded token**. |
| `packages/audit-client/src/append.test.ts` | **review before import** → include in W2C-2 | Fixture **action identifiers** only (`system.health_check`, `certification.application_submitted`, `certification.decision_recorded`, `reports.platform_aggregate_accessed`). No credential payloads. |
| Other audit-client files | n/a | Manifests already tracked |
| Defer within package | **none** | |

## Attention themes

| Theme | Finding |
|-------|---------|
| Audit event schemas | `auditLedgerAppendSchema` / aliases — append-only input shape |
| Tenant / audit context | `tenantId`, `tenantScoped`, `platformScope` fields + tests |
| Client transport | `baseUrl` + `fetch` append; token via caller callback |
| Token/JWT wording | Bearer injection pattern only — not a committed secret |
| Mock fixtures | Event **action strings** and boolean flags — safe identifiers |

## Out of scope (not proposed)

sdk, ui, notification-templates, database, auth, AI packages, apps, frontend-app, scripts/ops, terraform, docs/evidence bulk.
