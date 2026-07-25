# CONFORA REPO HEALTH 44 — Closed Packages Confirmation

Confirmed **CLOSED** (tracked, in-scope repo-health closeouts):

| Package | Notes |
|---------|-------|
| `packages/config` | Shared eslint/ts/prettier/csp |
| `packages/shared-types` | Auth/roles/health types |
| `packages/shared-kernel` | Tenant/entities/audit-context |
| `packages/audit-client` | Append client |
| `packages/sdk` | API client/schema |
| `packages/ui` | UI primitives |
| `packages/notification-templates` | Source + **EN** MJML closed; **HR MJML deferred** |
| `packages/i18n` | Locales + create-i18n |
| `packages/ai-prompts` | Safe prompt registry (RH41); **do not revert** |

## notification HR MJML

Remains **deferred** (3 untracked files). Must not be imported in this wave.

## RH43

Apps/api AI compatibility rework remains **blocked** until canonical AI source is imported/restored (RH43A).
