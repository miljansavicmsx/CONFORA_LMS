# Before / after — accessibility.yml

## Before (tracked at 66356586)

- `permissions.contents: write`
- `permissions.pull-requests: write`
- Actions referenced by major tags (`@v4`)
- Step **Publish report on main** ran `git add` / `git commit` / `git push`
- Artifact upload present
- PR comment step present

## After (R0-7S1)

- `permissions.contents: read`
- `permissions.pull-requests: write` retained for PR comment only (no repo mutation)
- Actions SHA-pinned (OD-R07-8):
  - `actions/checkout@11d5960a326750d5838078e36cf38b85af677262` # v4
  - `pnpm/action-setup@b906affcce14559ad1aafd4ab0e942779e9f58b1` # v4
  - `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020` # v4
  - `actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02` # v4
- Publish/commit/push step **removed**
- Artifact upload retained as sole report delivery channel
- Comment: do not reintroduce git mutation without new OD

## Triggers (unchanged)

push (main|master), pull_request, workflow_dispatch, schedule cron `0 3 * * *`
