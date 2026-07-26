# GitHub Environment setup (operator checklist)

YAML now references:

```yaml
environment:
  name: production
  url: https://api.confora.io
```

Repo administrators should configure in GitHub:

1. **Settings → Environments → New environment → `production`**  
2. **Required reviewers** — at least one Security or Release owner  
3. Optional: **Wait timer**  
4. Optional: **Deployment branches** — restrict to `main` only (dispatch still chooses ref)  
5. Confirm Actions secrets still present: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, optional `API_BASE_URL`, `SLACK_WEBHOOK_URL`  
6. Confirm Variables: `AWS_REGION`, `LAMBDA_FUNCTION_NAME` if overriding defaults  

This checklist is evidence/guidance. Completing it in the GitHub UI is outside the git commit and is listed as a **condition** on the GO WITH CONDITIONS verdict.
