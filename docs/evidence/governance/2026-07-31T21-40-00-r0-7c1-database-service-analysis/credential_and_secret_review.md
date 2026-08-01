# Credential and secret review

| Topic | Finding |
|-------|---------|
| Demo passwords in workflow YAML | Present as fixed ephemeral CI values (not GitHub Secrets) |
| Logs | Prior GHA logs echoed env in docker create argv (password visible in create command line) |
| Fork PRs | `pull_request` workflows may expose these ephemeral values (pre-existing) |
| Production secrets | `COMPLIANCE_DATABASE_URL` optional skip path in accessibility ingest — not used for service boot |
| Recommendation | Keep ephemeral fixed CI credentials for disposable services; prefer not logging full create argv; do not use production secrets for GHA postgres service |

No repository secrets were changed. Values are not reproduced here.
