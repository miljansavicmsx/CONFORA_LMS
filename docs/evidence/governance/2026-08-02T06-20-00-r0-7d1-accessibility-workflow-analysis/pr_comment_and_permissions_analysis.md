# PR-comment and permissions analysis

| Item | Finding |
|------|---------|
| Trigger | `pull_request` (not `pull_request_target`) |
| Permissions | contents:read; pull-requests:write |
| Comment script | `scripts/a11y/pr-comment.mjs` UNTRACKED |
| Token | `secrets.GITHUB_TOKEN` |
| Artifact upload | does not need pull-requests:write |

Recommendation: artifacts only for R0-7D2 minimum; drop write permission if comments removed.
