# Safe cleanup plan — NOT EXECUTED

| Rule | Status |
|------|--------|
| cleanup_executed | **false** |
| files_deleted | **false** |
| git_add_dot_used | **false** |

## Allowed later (human approval required)

1. Reclaim regenerable deps already ignored (`pnpm install` restore): root/`frontend-app` `node_modules`.
2. Remove local `apps/api/build-log.txt` after confirming not needed.
3. Remove temp classifier `scripts/ops/_tmp-repo-health-3-classify.mjs` after HEALTH-3 accepted (optional).
4. Keep ignoring `.tools`, `.local-backups`, env locals, QR screenshots.

## Forbidden without new explicit task

- Delete under `docs/evidence/`
- `git clean -fdx`
- `git add .`
- Mass-delete untracked `frontend-app/src` / `apps/api/src` / `scripts/ops`

## Note

Untracked volume is mostly **source/docs/evidence**, not leftover junk. Cleanup will **not** shrink status counts dramatically without a tracking strategy.
