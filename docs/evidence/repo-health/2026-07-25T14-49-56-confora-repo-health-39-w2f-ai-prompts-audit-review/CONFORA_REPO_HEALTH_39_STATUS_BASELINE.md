# CONFORA-REPO-HEALTH-39 — Status Baseline

```text
git rev-parse HEAD
→ 4587e0f349bd504f2257d4cc5994311c84423234

git rev-parse --short=8 HEAD
→ 4587e0f3

git branch --show-current
→ fix/ca-h01-frontend-f4-cutover

git status -sb
→ ## fix/ca-h01-frontend-f4-cutover...origin/fix/ca-h01-frontend-f4-cutover

git rev-parse --short=8 origin/fix/ca-h01-frontend-f4-cutover
→ 4587e0f3

git merge-base --is-ancestor 4587e0f3 origin/fix/ca-h01-frontend-f4-cutover
→ exit 0

git status --porcelain=v1 -uno
→ (empty)

git status --porcelain=v1 -- packages/i18n
→ (empty)

git status --porcelain=v1 -- packages/ui
→ (empty)

git status --porcelain=v1 --untracked-files=all -- packages/notification-templates
→ ?? …/hr.mjml (×3)

git status --porcelain=v1 --untracked-files=all -- packages/ai-prompts
→ ?? package.json, tsconfigs, src/index.ts, prompts/v1/*.json (×5)

git ls-files packages/ai-prompts
→ (empty)

git diff --cached --name-only
→ (empty)
```

Audit-only; no staging/import of `packages/ai-prompts`.
