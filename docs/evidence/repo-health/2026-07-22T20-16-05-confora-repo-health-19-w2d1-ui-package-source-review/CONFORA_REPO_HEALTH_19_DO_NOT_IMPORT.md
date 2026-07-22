# CONFORA-REPO-HEALTH-19 — Do not import

| Path / class | Reason |
|--------------|--------|
| `packages/notification-templates/**` | Explicitly deferred (RH18/RH19) |
| `packages/database/**` | High-risk later wave |
| `packages/auth/**`, `packages/ai-*/**`, `packages/audit/**`, `packages/types/**` | Out of W2D-1 |
| `packages/sdk/**` | Already remediated; not this wave |
| `apps/**`, `frontend-app/**`, `scripts/**`, `terraform/**` | Later waves |
| `docs/evidence` bulk | Curated later |
| `package.json` / lockfile / workspace config | Forbidden this task |
| Broad `git add packages` / `packages/ui` | Explicit paths only |
| `packages/ui/src/ai-disclosure.tsx` | Until i18n rework |
| Full barrel `packages/ui/src/index.ts` | Until disclosure rework / export split |

## This task confirmations

| Check | Result |
|-------|--------|
| Source files staged | **no** |
| Source files imported/committed | **no** |
| Application code changed | **no** |
| package.json / lockfile / gitignore changed | **no** |
| External pilot / security / DPO claimed | **no** |
