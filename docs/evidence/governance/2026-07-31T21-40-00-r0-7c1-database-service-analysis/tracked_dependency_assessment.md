# Tracked dependency assessment

See `tracked_dependency_assessment.json`.

| Path / concept | Classification |
|----------------|----------------|
| `packages/database` | `UNTRACKED_EXCLUDED` (OD-R07-2) |
| Tracked Prisma schema / migrations | `MISSING` |
| GHA service init SQL volumes | `MISSING` (none configured) |
| `@confora/database` filters | `OWNER_DECISION_REQUIRED` (R0-7E) |
| `apps/api` prisma helpers | `TRACKED_VALID` (not needed for boot) |

**R0-7C2 service-boot recovery can succeed without promoting `packages/database`.**
