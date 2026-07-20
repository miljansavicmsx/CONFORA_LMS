# CONFORA-REPO-HEALTH-10 — Do not import

| Path / class | Reason |
|--------------|--------|
| `packages/database/**` | Separate high-risk wave |
| `packages/auth/**` | Auth package stub / not this wave |
| `packages/ai-*/**` | AI governance deferral |
| `apps/api/src/**` | Later API waves |
| `frontend-app/src/**` | Later frontend waves |
| `scripts/ops/**` | Later ops wave |
| `docs/evidence` bulk | Curated evidence only, later |
| Broad `git add packages` | Mixes DB/AI/stubs with safe types |

## This task

- No staging/commit
- No W2B import executed
- No `.gitignore` changes
