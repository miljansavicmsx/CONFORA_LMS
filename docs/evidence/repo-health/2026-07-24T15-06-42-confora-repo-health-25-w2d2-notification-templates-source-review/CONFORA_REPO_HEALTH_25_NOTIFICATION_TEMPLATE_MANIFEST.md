# CONFORA-REPO-HEALTH-25 — Notification Template Manifest

**Closed manifest:** 9 candidates under `src/**` + `templates/**`  
**Timestamp:** `2026-07-24T15:06:42`

| Path | Bytes | SHA-256 | Artifact | Purpose | Imports | Exports | Placeholders | Class |
|------|-------|---------|----------|---------|---------|---------|--------------|-------|
| `src/event-keys.ts` | 1561 | `4746bab9d209680b22ca57fcc8c097090faeabf7995d6081a85d165cb1120f80` | TS catalog | Event key enum + guard | none | `NOTIFICATION_EVENT_KEYS`, `NotificationEventKey`, `isNotificationEventKey` | n/a | **IMPORT_CANDIDATE** |
| `src/events.ts` | 4851 | `803c0073890bd46566d07078a809b8d4de50b0f1a08f8b9daddc2b80ac247fb9` | TS loader | Subjects + MJML load + interpolate | `node:fs`, `node:path`, `./event-keys` | keys re-export, `interpolate`, `loadBundledEmailTemplate`, types | `{{k}}` via interpolate | **REWORK_REQUIRED** |
| `src/index.ts` | 58 | `2c23a6a8303beca0bf4c811fd0833b406ffb1f92d9c0e84c62313293cd651082` | TS barrel | Re-exports keys + events | `./event-keys`, `./events` | `export *` both | n/a | **REWORK_REQUIRED** |
| `templates/events/audit.integrity.failed/v1/en.mjml` | 615 | `3996948a7bccb6cbb36c2ef16d32dfdafdd6e2021317f080a57d863dc56e2430` | MJML | Audit integrity alert shell | n/a | n/a | `heading`, `bodyText`, `footer` | **DEFER** |
| `templates/events/audit.integrity.failed/v1/hr.mjml` | 615 | `3996948a7bccb6cbb36c2ef16d32dfdafdd6e2021317f080a57d863dc56e2430` | MJML | Same as EN (not localized) | n/a | n/a | same | **DEFER** |
| `templates/events/report.mr_monthly_digest/v1/en.mjml` | 737 | `7788bb7f4e3178b75a6800f2be2e43c454c52faa38af747b75b5ca205e664c39` | MJML | MR monthly digest shell | n/a | n/a | `heading`, `bodyText`, `footer` | **DEFER** |
| `templates/events/report.mr_monthly_digest/v1/hr.mjml` | 739 | `6b082e124093f30de571c8a25aa1436ca254718ff7a214eb8e03478724622a4a` | MJML | Partial HR (title only) | n/a | n/a | same | **DEFER** |
| `templates/standard/v1/en.mjml` | 719 | `e75cbf5b8ac111fb1b8ec79c1583d7880b8e5301bf19dc013340fb7461c318be` | MJML | Default/fallback shell | n/a | n/a | `heading`, `bodyText`, `footer` | **DEFER** |
| `templates/standard/v1/hr.mjml` | 719 | `e75cbf5b8ac111fb1b8ec79c1583d7880b8e5301bf19dc013340fb7461c318be` | MJML | Same as EN (not localized) | n/a | n/a | same | **DEFER** |

## Notes

- Audit EN/HR share identical SHA-256 (byte-identical English).
- Standard EN/HR share identical SHA-256.
- No `DO_NOT_IMPORT` within closed candidate set (risks are rework/defer, not absolute ban of taxonomy).
