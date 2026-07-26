# CONFORA REPO HEALTH 47 — Closed Packages Confirmation

## Tracked package roots (`git ls-files packages`)

```text
ai-client
ai-prompts
audit-client
config
i18n
notification-templates
sdk
shared-kernel
shared-types
ui
```

## Closed packages (10)

| Package | Closed by | Notes |
|---------|-----------|-------|
| `packages/config` | earlier waves | TypeScript base configs; consumed by ai-client/ai-prompts |
| `packages/shared-types` | earlier waves | shared type contracts |
| `packages/shared-kernel` | earlier waves | shared kernel utilities |
| `packages/audit-client` | earlier waves | audit client |
| `packages/sdk` | earlier waves | SDK |
| `packages/ui` | earlier waves | UI components; clean |
| `packages/notification-templates` | RH38 | source + EN MJML closed; **HR MJML deferred** |
| `packages/i18n` | RH37/RH38 | locale parity closed |
| `packages/ai-prompts` | RH39–RH41 | fail-closed loader; import verified |
| `packages/ai-client` | RH45–RH46 | **source subset (5 files)**; generated artifacts deferred |

## Residual within closed packages

- `packages/notification-templates`: 3 HR MJML templates remain untracked/deferred (not a reopening of the package; localization rework pending).
- `packages/ai-client`: `src/index.d.ts`, `src/index.js`, `src/index.js.map` remain untracked (DO_NOT_IMPORT); does not reopen the source subset.

All 10 closed packages remain closed. No revert indicated.
