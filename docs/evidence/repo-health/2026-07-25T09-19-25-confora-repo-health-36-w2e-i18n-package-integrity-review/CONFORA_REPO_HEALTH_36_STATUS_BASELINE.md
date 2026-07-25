# CONFORA-REPO-HEALTH-36 — Status Baseline

```text
git rev-parse HEAD
→ f1cbfa97497f8d6cf423f799169dc6634dc53305

git rev-parse --short=8 HEAD
→ f1cbfa97

git branch --show-current
→ fix/ca-h01-frontend-f4-cutover

git status -sb
→ ## fix/ca-h01-frontend-f4-cutover...origin/fix/ca-h01-frontend-f4-cutover

git rev-parse --short=8 origin/fix/ca-h01-frontend-f4-cutover
→ f1cbfa97

git merge-base --is-ancestor f1cbfa97 origin/fix/ca-h01-frontend-f4-cutover
→ exit 0

git status --porcelain=v1 -uno
→ (empty)

git status --porcelain=v1 -- packages/ui
→ (empty)

git status --porcelain=v1 -- packages/i18n
→ (empty)

git status --porcelain=v1 --untracked-files=all -- packages/notification-templates
→ ?? …/audit.integrity.failed/v1/hr.mjml
  ?? …/report.mr_monthly_digest/v1/hr.mjml
  ?? …/standard/v1/hr.mjml   (only)

git diff --cached --name-only
→ (empty)
```

## Constraints honored

Audit/report only · no source/template staging · no HR MJML import · no package.json/lock/workspace/.gitignore/apps edits · evidence limited to RH36 folder.
