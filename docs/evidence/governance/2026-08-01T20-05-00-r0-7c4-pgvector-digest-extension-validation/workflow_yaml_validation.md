# Workflow YAML validation

| Check | Result |
|-------|--------|
| Both services use approved index digest | Yes |
| No mutable-only image in service blocks | Yes |
| R0-7C2 health quoting intact | Yes |
| Retries 10 / interval 10s / timeout 5s | Yes |
| Extension step only in ci.yml | Yes |
| Triggers/permissions/deps/Prisma steps unchanged | Yes |
| No new external Action | Yes |
