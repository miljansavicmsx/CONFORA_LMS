# CONFORA-REPO-HEALTH-8 — Do not import yet

| Item | Reason |
|------|--------|
| `packages/database/**` | 63 Prisma migrations + seeds + `.env.example` — dedicated later wave |
| `packages/ai-client/**` compiled `.js`/`.js.map`/`.d.ts` | Build artifacts — prefer TS source later, not binaries |
| `packages/ai-prompts/**` | AI prompt JSON — governance review |
| `packages/ai-client` source | Defer with AI wave |
| `packages/ai-governance`, `auth`, `audit`, `types` | README stubs only — no bulk package invent |
| Broad `git add packages` / `packages/` | Would mix safe manifests with DB/AI risk |
| App source (`apps/api/src`, `frontend-app/src`) | Later waves per RH6 — not W2 |
| `docs/evidence` bulk | Still deferred |

## Non-actions this task

- No staging/commit
- No `.gitignore` changes
- No W2 import executed
