# CONFORA R0-3 REPORT — Deployment Safety Containment

## Verdict

**GO WITH CONDITIONS**

## Evidence folder

`docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/`

## Base HEAD

`e27cdc05` on `fix/ca-h01-frontend-f4-cutover`

## Changed files

1. `.github/workflows/deploy-backend.yml` only

## Before / after (production deploy)

| | Before | After |
|---|--------|-------|
| Push to `main` deploys | Yes | **No** |
| Tag deploys | Yes | **No** |
| Manual gate | No | **Yes** (`workflow_dispatch` + `DEPLOY_PRODUCTION` + Environment `production`) |
| Untracked `backend/` | Deployable | **Fail-closed** |
| Other backend target | — | **None** (no Nest redirect) |

## Validation

- YAML: **OK** (PyYAML)
- Trigger analysis: `workflow_dispatch` only; `has_push=false`
- Local gate simulation: `tracked_backend_files=0` → fail-closed

## Rollback

Documented in `ROLLBACK.md`; original file in `before/deploy-backend.yml`

## Conditions

1. Configure GitHub Environment `production` required reviewers in UI  
2. R0-7 for remaining non-deploy CI untracked-path issues  
3. Lambda deploy stays blocked until `backend/` is tracked (OQ-3)

## Non-modification confirmation

No application code, schemas, migrations, or runtime configuration modified.
