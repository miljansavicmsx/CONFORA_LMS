# Proposed R0-7D2 scope (planning only)

## Maximums

- Workflow files changed: **1** (`.github/workflows/accessibility.yml`)
- New script files: **≤3**
- Total operational files: **≤6**
- Evidence: separate R0-7D2 folder later

## Proposed files

| Path | Status | Change | Owner approval |
|------|--------|--------|----------------|
| .github/workflows/accessibility.yml | TRACKED | Narrow to frontend-app; remove FastAPI/untracked deps | yes |
| frontend-app/package-lock.json | UNTRACKED | Track for npm ci | yes |
| tools/a11y or packages/ui contrast | UNTRACKED/new | Promote or reimplement (A/B/C/D) | yes |
| frontend-app/e2e a11y smoke | optional new | Public axe vs preview | yes |
| scripts/a11y/pr-comment.mjs | UNTRACKED | Prefer omit | yes if retain |
| compliance-iso | TRACKED | unchanged | n/a |

Out of scope: packages/database, Prisma, backend/, apps/web|admin promotion, deploy.
Integration base for planning: `4090be85a0f8e423d199610f82e3949c899cc90b`.
