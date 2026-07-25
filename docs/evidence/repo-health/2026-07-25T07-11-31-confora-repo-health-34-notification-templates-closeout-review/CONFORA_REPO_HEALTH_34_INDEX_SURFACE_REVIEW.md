# CONFORA-REPO-HEALTH-34 — Index Surface Review

`packages/notification-templates/src/index.ts` exports only:

- `event-keys` (`NOTIFICATION_EVENT_KEYS`, `isNotificationEventKey`, type)
- `escape` (`escapeHtmlText`, `sanitizePlainTextSubject`)
- `subjects` (`NOTIFICATION_SUPPORTED_LOCALES`, `resolveNotificationSubject`, types)

## Explicit non-exports

| Surface | Exported via barrel? |
|---------|----------------------|
| `events.ts` | **no** |
| `loadBundledEmailTemplate` / loader | **no** |
| `interpolateMjmlAllowlisted` / `interpolate` | **no** |
| Templates / MJML paths | **no** |
| Provider / recipient / tenant routing APIs | **no** |

Covered by `index.test.ts` (safe surface + no provider/recipient/tenant APIs).

`index_safe_surface_pass: true`
