# Accessibility workflow inventory

Source: tracked `.github/workflows/accessibility.yml` at `4090be85a0f8e423d199610f82e3949c899cc90b`.

## Global

- Triggers: push main/master; all pull_request; workflow_dispatch; nightly cron `0 3 * * *`
- Concurrency: `a11y-ci-` + github.ref with cancel-in-progress
- Permissions: `contents: read`; `pull-requests: write` (PR comments)
- Event: `pull_request` (not `pull_request_target`)
- Top-level env includes demo password placeholders (values omitted from evidence)
  and local URLs on 127.0.0.1

## Job: accessibility

| Step | Command / action | Mutation | Notes |
|------|------------------|----------|-------|
| Install workspace | pnpm install --frozen-lockfile | no | PASS on run 30735089256 |
| Design token contrast | pnpm a11y:contrast | no | FIRST FAIL — missing tools/a11y |
| Build apps | pnpm build; frontend-app npm ci && build | no | not reached |
| docker-compose.a11y-ci | docker compose up | no | FastAPI stack — legacy vs frontend-app-only |
| Seed demo users | pip + untracked python seed | no | FastAPI/Dynamo |
| Install e2e | tests/e2e npm ci | no | tests/e2e UNTRACKED (0 tracked) |
| Playwright / T1–T7 | untracked specs | no | never reached |
| Lighthouse / compare / aggregate | scripts/a11y/*.mjs | no | UNTRACKED |
| Upload artifacts | upload-artifact | no | PASS after failures |
| PR comment / notify | untracked scripts | PR write / secrets | fail if:always |
| Record CI outcome | packages/database path | optional DB | skipped without secret |

## Job: compliance-iso

Separate ISO job with postgres. First failure: missing `packages/database`.
Out of R0-7D repair scope. Machine-readable: `accessibility_workflow_inventory.json`.
