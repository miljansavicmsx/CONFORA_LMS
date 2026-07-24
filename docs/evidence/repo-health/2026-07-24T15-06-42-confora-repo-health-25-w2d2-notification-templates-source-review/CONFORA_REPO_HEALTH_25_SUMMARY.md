# CONFORA-REPO-HEALTH-25 — Summary

| Item | Value |
|------|-------|
| Task | `CONFORA_REPO_HEALTH_25_W2D2_NOTIFICATION_TEMPLATES_SOURCE_REVIEW` |
| Based on | `ed3d09b2` |
| Branch | `fix/ca-h01-frontend-f4-cutover` |
| Candidates | **9** (manifest closed) |
| Import candidates | **1** (`event-keys.ts`) |
| Rework required | `events.ts`, `index.ts` |
| Defer | **6** MJML shells (pending safe loader + locale authenticity) |
| Minimal first import | `packages/notification-templates/src/event-keys.ts` only |
| Verdict | `CONFORA_REPO_HEALTH_25_AUDIT_ONLY_READY_FOR_REVIEW` |

## Headline

1. HEAD `ed3d09b2` confirmed; tracked tree and `packages/ui` clean; candidates untracked/unstaged.
2. `event-keys.ts` is browser-safe event taxonomy with proper education / exam / decision / issuance / appeal / complaint / contact separation → **IMPORT_CANDIDATE**.
3. `events.ts` uses Node `fs` at runtime, English-only subjects for all locales, and **unescaped** `{{var}}` interpolation → **REWORK_REQUIRED**.
4. Barrel `index.ts` re-exports Node loader → **REWORK_REQUIRED**.
5. MJML shells are structurally safe (no URLs/scripts/recipient logic) but HR copies are largely English duplicates; defer until loader/i18n rework.
6. Do **not** import templates until findings are reviewed; never use broad `git add packages/notification-templates`.
