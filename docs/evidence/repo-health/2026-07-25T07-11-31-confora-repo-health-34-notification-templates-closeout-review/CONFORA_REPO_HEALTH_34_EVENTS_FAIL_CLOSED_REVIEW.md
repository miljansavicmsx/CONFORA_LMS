# CONFORA-REPO-HEALTH-34 — Events Fail-Closed Review

## Allowlist

```ts
MJML_TEMPLATE_VAR_KEYS = ['heading', 'bodyText', 'footer']
```

## `interpolateMjmlAllowlisted`

| Behavior | Confirmed |
|----------|-----------|
| Unknown keys rejected | **yes** |
| Missing allowlisted keys rejected | **yes** |
| Values HTML-escaped via `escapeHtmlText` before insert | **yes** |
| Leftover `{{…}}` rejected | **yes** |
| No raw HTML passthrough | **yes** |

## Legacy `interpolate()`

Throws fail-closed (`never`); does not interpolate.

## Loader

- Lazy `require('node:fs')` only inside loader path
- No import-time template I/O
- Missing template throws; non-EN locales may fall back to EN with `mjmlUsedFallback: true`
- Documented: does not send email, choose recipients, route tenants, or make certification decisions

Covered by `events.interpolate.test.ts`.

`events_fail_closed_pass: true`
