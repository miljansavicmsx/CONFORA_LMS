# CONFORA-REPO-HEALTH-5 — Recommended next actions

1. **Review** `CONFORA_REPO_HEALTH_5_PROPOSED_GITIGNORE_R2.patch.txt`.
2. If approved, open a follow-up task to **apply** R2 to `.gitignore` and commit **only** that file.
3. Optionally (separate approval): delete local `build-log*.txt`, empty `package-lock.json` stubs, and `_tmp-repo-health-*.mjs` after ignore is in place.
4. Continue curated tracking waves for real source (`frontend-app/src`, `apps/api/src`, `scripts/ops`) — **not** via ignore.
5. Keep `docs/evidence/` visible; commit evidence selectively under retention policy.

## Non-actions for this task

- Do not apply patch now.
- Do not `git add .`.
- Do not delete/move files now.
- Do not ignore source or evidence trees.
