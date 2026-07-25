# CONFORA-REPO-HEALTH-33 — Status Baseline

## Commands (representative)

```text
git rev-parse HEAD
→ 68a32acd36d38aad202a707f84774b1b43505e10

git branch --show-current
→ fix/ca-h01-frontend-f4-cutover

git status -sb
→ ## fix/ca-h01-frontend-f4-cutover...origin/fix/ca-h01-frontend-f4-cutover

git rev-parse --short=8 origin/fix/ca-h01-frontend-f4-cutover
→ 68a32acd

git merge-base --is-ancestor 68a32acd origin/fix/ca-h01-frontend-f4-cutover
→ exit 0 (remote contains commit)

git status --porcelain=v1 -uno
→ (empty) tracked working tree clean

git status --porcelain=v1 -- packages/ui
→ (empty)

git status --porcelain=v1 -- packages/notification-templates/src
→ (empty)

git log -1 --oneline 68a32acd
→ 68a32acd chore(repo): add english mjml notification templates

git rev-parse 68a32acd^
→ c87b736f260b4dee36277cca434d4ff04b7d1cc0
```

## Notes

- Large untracked trees exist elsewhere in the repo; they are out of scope.
- Tracked cleanliness for this verification uses `-uno` (ignore untracked) plus package-scoped porcelain checks.
- Audit-only: no source staged/committed by this task.
