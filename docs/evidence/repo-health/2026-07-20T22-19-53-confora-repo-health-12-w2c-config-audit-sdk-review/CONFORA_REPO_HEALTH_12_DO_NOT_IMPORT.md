# CONFORA-REPO-HEALTH-12 — Do not import

| Path / class | Reason |
|--------------|--------|
| `packages/database/**` | Separate high-risk wave |
| `packages/auth/**` | Not W2C |
| `packages/ai-*/**` | AI governance deferral |
| `apps/api/src/**` | Later API waves |
| `frontend-app/src/**` | Later frontend waves |
| `scripts/ops/**` | Later ops wave |
| `docs/evidence` bulk | Curated later |
| Broad `git add packages` | Mixes deferred UI/templates/DB with safe config |
| W2C-1 must not silently include W2C-2/3 | Keep commits small |

## This task

- No staging/commit; W2C not imported
