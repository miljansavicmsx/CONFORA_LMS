# CONFORA-REPO-HEALTH-18 — Do not import

| Path / class | Reason |
|--------------|--------|
| Broad `git add packages` / `packages/ui` / `packages/notification-templates` | Mixes risk; use explicit paths after review |
| `packages/database/**` | High-risk migrations/schema/seeds |
| `packages/ai-client` compiled `.js`/`.map`/`.d.ts` | Build artifacts |
| `packages/ai-prompts/**`, `ai-governance` | AI governance later |
| README-only stubs as “packages” | No real source yet |
| `apps/**`, `frontend-app/**` | Later waves |
| `scripts/ops/**`, `terraform/**` | Later |
| `docs/evidence` bulk | Curated later |

## This task

- No staging/commit; W2D not imported
- No external pilot / security / DPO-legal approval claimed
