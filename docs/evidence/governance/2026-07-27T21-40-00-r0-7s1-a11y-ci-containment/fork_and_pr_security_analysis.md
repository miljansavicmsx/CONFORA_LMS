# Fork and PR security analysis (R0-7S1)

## Triggers (unchanged by R0-7S1)

| Trigger | Present |
|---------|---------|
| `push` branches `main`, `master` | yes |
| `pull_request` | yes |
| `workflow_dispatch` | yes |
| `schedule` cron `0 3 * * *` | yes |
| `pull_request_target` | **absent** |

## Same-repository pull requests

- Workflow runs on `pull_request` against the PR head ref.
- Effective permissions: `contents: read`, `pull-requests: write`.
- Repository-content write via `GITHUB_TOKEN` is denied by permission grant.
- Same-repo PRs may receive configured secrets (GitHub default). R0-7S1 did not
  add secrets; residual SMTP/Slack/demo-password surface is F-L2 (later tasks).

## Fork pull requests

- Fork workflows typically do **not** receive repository secrets.
- Even if a fork workflow ran, `contents: read` prevents repository mutation.
- No `pull_request_target` checkout-of-untrusted-code-with-elevated-token pattern.

## Why contents mutation is prevented

1. Explicit workflow permission `contents: read`.
2. No job-level permission override.
3. No `git add` / `git commit` / `git push` steps.
4. Publish-on-main step removed.
5. Checkout / upload-artifact actions do not elevate contents write.

## Why `pull-requests: write` is currently bounded

Only the step **PR comment summary** uses `GITHUB_TOKEN` with:

- `PR_NUMBER: ${{ github.event.pull_request.number }}` — numeric event context,
  not PR title/body/branch/actor interpolated into shell.
- `run: node scripts/a11y/pr-comment.mjs`

No workflow step merges, closes, labels, or retitles a PR.

## Residual script dependency

`scripts/a11y/pr-comment.mjs` is **untracked**. This evidence does **not**
certify future tracked script behavior. R0-7D must prove comment-only use or
remove `pull-requests: write` (F-L1).
