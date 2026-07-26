# Rollback — R0-1B1

## Scope of change

R0-1B1 adds **documentation only** (governance markdown + evidence). No code, CI, schema, migration, runtime config, Cursor rule, or GitHub setting was changed. Rolling back has **no runtime effect**.

## Rollback boundary

- Branch: `governance/r0-1b1-authority-chain`
- Two commits: (1) normative authority chain; (2) governance evidence.
- Base: `1f141fe18aafafd0405b1539788234d253f40f4b`.

## How to roll back

### Before any merge (branch only)
- Delete the local and remote branch, or reset it to the base commit:
  - `git checkout fix/ca-h01-frontend-f4-cutover`
  - `git branch -D governance/r0-1b1-authority-chain`
  - `git push origin --delete governance/r0-1b1-authority-chain` (only if pushed and authorized)

### After merge
- Revert the merge or the two commits in a new commit:
  - `git revert <commit2-sha>`
  - `git revert <commit1-sha>`
- Do **not** force-push shared history.

## Safety notes

- Reverting R0-1B1 removes tracked governance and **re-opens C-01** (tracked `AGENTS.md` → untracked Baseline). This is a governance regression, not a safety regression.
- Rollback does **not** affect R0-3 deployment containment, the deny-all allowlist, or administrator-bypass status; those live on the integration branch and are unchanged here.
- No accepted risk is re-armed by this rollback.
