# CONFORA-REPO-HEALTH-27 — Events Source Review

**File:** `packages/notification-templates/src/events.ts` (untracked)  
**Current import recommendation:** **NO-GO**

## Imports

| Import | Role |
|--------|------|
| `node:fs` `readFileSync` | Sync MJML file load |
| `node:path` `join` | Path construction |
| `./event-keys` (type + re-export) | Event key catalog |

## Exports

- Re-exports: `NotificationEventKey`, `NOTIFICATION_EVENT_KEYS`, `isNotificationEventKey`
- `NotificationLocale`, `BundledEmailTemplate`
- `interpolate(template, vars)`
- `loadBundledEmailTemplate(eventKey, locale)`

## Behavior

| Aspect | Finding |
|--------|---------|
| Loader | Prefer `templates/events/{key}/v1/{locale}.mjml` → event `en` → standard `{locale}` → standard `en` |
| Interpolation | Raw string replace of `{{k}}` with `v` — **no escaping** |
| Escaping | **absent** |
| Locale / subject | `SUBJECT_EN` used for all locales; comment admits HR uses EN |
| FS | Sync read on **call** of loader (not at module import); Node-only |
| Side effects at import | Path constants only; **no** `readFileSync` at import time |
| Use of event keys | Keys type `NotificationEventKey`; subjects keyed by full catalog |

## Present / absent risks

| Risk | Present? |
|------|----------|
| Unsafe interpolation | **yes** |
| Recipient logic | **no** |
| Delivery / provider logic | **no** |
| Workflow decision logic | **no** |
| Tenant routing | **no** |

## Verdict

**REWORK_REQUIRED** before any import.
