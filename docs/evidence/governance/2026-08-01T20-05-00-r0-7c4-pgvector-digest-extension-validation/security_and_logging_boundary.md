# Security and logging boundary

- Step uses `set -euo pipefail` without shell tracing
- Prints only pass/fail and version strings
- Does not print passwords, env dumps, or connection URIs
- Ephemeral CI credentials only
- No production endpoints
