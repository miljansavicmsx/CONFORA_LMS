# Owner decisions applied

| Decision | Application |
|----------|-------------|
| OD-R07-1 | Lockfile regenerated in isolated clean worktree with pnpm `9.14.2` using `--lockfile-only --ignore-scripts` |
| Frontend workspace | `frontend-app` **not** added to `pnpm-workspace.yaml`; classified `TRACKED_STANDALONE_OUTSIDE_ROOT_WORKSPACE` |
| Root drift | Direct `jsqr` / `pngjs` removed from lockfile; not added to `package.json` |
| OD-R07-8 | All `uses:` in `confora-qa.yml` pinned to full 40-character SHAs |
| Deferred | `ci.yml`, workspace yaml, root package.json, untracked apps, database package, FastAPI backend untouched |
