# CONFORA-REPO-HEALTH-31 — Events Review

| Check | Result |
|-------|--------|
| Unsafe raw interpolate | **removed**; legacy fail-closed |
| Allowlist `heading`/`bodyText`/`footer` | **PASS** |
| Unknown / missing rejected | **PASS** |
| HTML escape before insert | **PASS** |
| Raw HTML / script injection | blocked |
| Attribute interpolation contexts | **not used** |
| Subject path separate | **PASS** |
| Import-time fs | **false**; lazy Node-only on load |
| Provider / recipient / tenant / RBAC / decisions | **none** |

**`events_pass`: true**
