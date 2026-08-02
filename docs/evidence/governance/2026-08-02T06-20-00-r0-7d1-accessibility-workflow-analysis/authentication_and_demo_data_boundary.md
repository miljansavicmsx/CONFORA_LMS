# Authentication and demo-data boundary

Credential **values are omitted** from this evidence package.

| Surface | Classification | Notes |
|---------|----------------|-------|
| Workflow `A11Y_DEMO_PASSWORD` | EPHEMERAL_CI_VALUE + UNSAFE_LOG_SURFACE | Literal in YAML; appears in Actions env dumps |
| Workflow `DEV_LOCAL_PASSWORD` | EPHEMERAL_CI_VALUE + UNSAFE_LOG_SURFACE | Same pattern |
| Compliance postgres password | EPHEMERAL_CI_VALUE + UNSAFE_LOG_SURFACE | Other job |
| Notify/SMTP/Slack secrets | GITHUB_SECRET_REQUIRED | optional notify step |
| `COMPLIANCE_DATABASE_URL` | GITHUB_SECRET_REQUIRED | record outcome |
| FastAPI demo seed | EXTERNAL_ENVIRONMENT_DEPENDENCY + UNTRACKED | compose stack |

## Recommendations

1. Remove fixed passwords from top-level `env:` to reduce log echo.
2. Prefer public-route checks without demo passwords for first recovery.
3. Owner decision before authenticated axe with shared demo credentials.
