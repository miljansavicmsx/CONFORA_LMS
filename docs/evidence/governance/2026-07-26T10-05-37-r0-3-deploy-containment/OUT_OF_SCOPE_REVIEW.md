# Out-of-scope review

## In scope for R0-3

- Inspection of all tracked `.github/workflows/**`
- Containment of production deploy path in `deploy-backend.yml`
- Evidence for before/after, validation, rollback, and status

## Explicitly out of scope (not modified)

- Application source (`apps/**` application TS/TSX, `frontend-app/src/**`, etc.)
- Database schemas and migrations (`packages/database/**`, `prisma/**`)
- Runtime configuration (`.env`, app configs)
- Cursor rules (`.cursor/rules/**`)
- Existing governance standards under `docs/governance/**` and `docs/architecture/**` (proposed drafts live only in this evidence folder)
- Import of `backend/` or any other untracked package
- HR MJML templates
- Full CI reconstruction of non-deploy workflows (deferred to R0-7)

## Other workflows — deploy risk

No other tracked workflow performs AWS Lambda `update-function-code` or targets `api.confora.io`. Their remaining untracked-path references are CI/test/build issues for R0-7, not active production-deploy footguns under R0-3.
