# Before / after behaviour — deploy-backend.yml

## Before (unsafe)

Source copy: `before/deploy-backend.yml`

```yaml
on:
  push:
    branches:
      - main
    tags:
      - "v*.*.*"
```

Behaviour:

1. Any push to `main` started a production deploy job.  
2. Job checked out the repo and used `working-directory: backend`.  
3. `backend/` has **0 tracked files** in this repository — a fresh CI checkout would lack the tree; a dirty runner or force-add could deploy non-reviewed code.  
4. Updated Lambda `confora-lms-api` and smoked `https://api.confora.io/health`.  
5. No confirmation string, no GitHub Environment approval block in YAML.

## After (contained)

Source copy: `after/deploy-backend.yml`

```yaml
on:
  workflow_dispatch:
    inputs:
      confirm_production: # must equal DEPLOY_PRODUCTION
      deploy_reason:      # required
      ref_note:           # optional
```

Job uses:

```yaml
environment:
  name: production
  url: https://api.confora.io
```

Preflight (fail-closed):

- Confirm input == `DEPLOY_PRODUCTION`  
- Non-empty `deploy_reason`  
- `backend/` directory exists  
- `git ls-files -- backend` count > 0  
- Required files exist **and** are tracked:  
  `backend/requirements.txt`, `backend/lambda_handler.py`, `backend/main.py`, `backend/config.py`

Deploy steps (bundle → AWS credentials → `update-function-code` → wait → smoke → Slack) are **preserved** so that when `backend/` is properly tracked and an owner manually approves, the same Lambda target can still be used. **No redirect** to Nest/`apps/api`.

## Diff summary

```text
.github/workflows/deploy-backend.yml | 98 ++++++++++++++++++++++++++++++++++--
 1 file changed, 93 insertions(+), 5 deletions(-)
```

Full patch: `deploy-backend.diff.txt`
