# Rollback procedure — R0-3

## Purpose

Restore the previous `deploy-backend.yml` if containment must be reversed (not recommended while `backend/` is untracked).

## Method 1 — evidence pack copy

```powershell
Copy-Item `
  docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/before/deploy-backend.yml `
  .github/workflows/deploy-backend.yml -Force
```

## Method 2 — git history

After the containment commit exists:

```bash
git show <commit-before-r0-3>:.github/workflows/deploy-backend.yml > .github/workflows/deploy-backend.yml
```

Or:

```bash
git checkout <commit-before-r0-3> -- .github/workflows/deploy-backend.yml
```

## Method 3 — revert commit

```bash
git revert <r0-3-commit-sha>
```

## Post-rollback warning

Rolling back re-arms **automatic production deploy on push to `main`**. Do not roll back unless:

1. `backend/` is fully tracked and reviewed, **and**  
2. Security/Release owners accept auto-deploy risk, **or**  
3. An emergency requires the old file and a compensating manual freeze on the `main` branch.

## Preserved forward path (preferred over rollback)

Keep contained workflow; when OQ-3 tracks `backend/`, operators can:

1. Ensure GitHub Environment `production` has required reviewers.  
2. Actions → Deploy backend (Lambda) → Run workflow.  
3. Enter `DEPLOY_PRODUCTION` and a deploy reason.  
4. Await environment approval, then preflight + deploy.
