# CONFORA-REPO-HEALTH-1 — Report

| Field | Value |
|-------|-------|
| Evidence | `docs/evidence/repo-health/2026-07-19T05-53-16-confora-repo-health-1/` |
| Tracked files | 705 |
| Status entries | 1682 (reported baseline 1680) |
| Local files reported | 276,800 / 6.22 GB |
| Cleanup executed | false |
| Verdict | `CONFORA_REPO_HEALTH_1_AUDIT_ONLY_READY_FOR_REVIEW` |

## Biggest untracked groups

1. `docs/` (708) — largely evidence + many policy markdown files  
2. `frontend-app/` (460) — mostly `src/` + `e2e/`  
3. `scripts/` (245) — mostly `ops/`  
4. `apps/` (194) — mostly `api/`  

## .gitignore gaps (headline)

- Root `.gitignore` **untracked**
- Not ignored: `.tools/`, `.local-backups/`, `tmp-keycloak-setup-output.txt`, inventory dumps, root QR screenshot, `.cursor/`

## Safe cleanup recommendations

1. Review and commit hardened `.gitignore` (proposal only in this package).  
2. Optionally reclaim ~2.3+ GB via regenerable `node_modules` / `.tools` / dist caches **after approval**.  
3. Quarantine/delete local-only QR/keycloak temp files **after approval**.  
4. Never `git add .`; never mass-delete evidence.

## Final verdict

`CONFORA_REPO_HEALTH_1_AUDIT_ONLY_READY_FOR_REVIEW`
