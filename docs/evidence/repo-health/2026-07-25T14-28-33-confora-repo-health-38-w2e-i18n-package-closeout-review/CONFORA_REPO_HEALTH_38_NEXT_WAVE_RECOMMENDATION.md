# CONFORA-REPO-HEALTH-38 — Next Wave Recommendation

## Closed this wave

W2E `packages/i18n` — integrity (RH36) → rework (RH37/`dbb50fe9`) → verify → **closeout GO**.

## Residual deferred (other packages)

- `packages/notification-templates` HR MJML ×3 — still untracked/deferred
- F6/F7 shell notes — non-blocking; optional future polish

## Recommended next action

`CONTINUE_NEXT_REPO_HEALTH_PACKAGE_REVIEW`

Per RH35 remaining classification, safest next **new** review target:

1. **`packages/ai-prompts`** — REVIEW_REQUIRED (prompt governance; small untracked source+JSON)
2. Alternatively **`packages/ai-client`** — REVIEW_REQUIRED (network/Bearer; strip compiled `src/*.js` first)
3. Do **not** start with README stubs or `packages/database`

Do not import HR MJML in the next wave unless a dedicated localization rework is scheduled.
