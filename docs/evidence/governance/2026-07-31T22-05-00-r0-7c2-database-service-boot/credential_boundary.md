# Credential boundary — R0-7C2

| Check | Result |
|-------|--------|
| PostgreSQL credentials | Fixed ephemeral CI-only values in workflow YAML |
| Production credentials present | No |
| New GitHub secret/variable introduced | No |
| Production database endpoint contacted | No |
| Permission escalation | No |
| `pull_request_target` introduced | No |

## Pre-existing observation

Compliance job logs expose an `A11Y_DEMO_PASSWORD` environment value.

Classification: `PRE_EXISTING_SECRET_SURFACE_OBSERVATION`

Remediation assigned to: **R0-7D / R0-7E**

The actual password value is intentionally **not** reproduced in this evidence package.
