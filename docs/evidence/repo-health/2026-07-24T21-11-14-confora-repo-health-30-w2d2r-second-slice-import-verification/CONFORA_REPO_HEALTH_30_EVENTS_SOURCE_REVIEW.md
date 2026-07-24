# CONFORA-REPO-HEALTH-30 — Events Source Review

**File:** `packages/notification-templates/src/events.ts` (6425 B, sha256 `e55912ed…`)

| Check | Result |
|-------|--------|
| Unsafe raw interpolate | **removed** |
| Legacy `interpolate()` fail-closed | **PASS** |
| Allowlisted vars exactly `heading`,`bodyText`,`footer` | **PASS** |
| Unknown / missing vars rejected | **PASS** |
| HTML escape before insertion | **PASS** |
| Raw HTML passthrough | **false** |
| Script/style injection | blocked by escape |
| href/src/style/script attribute interpolation | **not used** (text-node placeholders only) |
| Subject/plain-text separate | **PASS** (`resolveNotificationSubject`) |
| Provider / recipient / tenant / RBAC / workflow decisions | **none** |
| Import-time fs read | **false** |
| Lazy Node-only load | **PASS**; throws if MJML missing while deferred |

Hashes match RH28 rework verification content.
