# CONFORA-REPO-HEALTH-23 — Next Wave Recommendation

## Recommended next action (choose one)

`W2D2_NOTIFICATION_TEMPLATES_SOURCE_REVIEW_AUDIT_ONLY_OR_RH24_FULL_UI_PACKAGE_INTEGRITY_REVIEW`

### Option A — W2D-2 notification templates source review (audit-only)

- Review the **9 untracked** source/template files under `packages/notification-templates/` (events, index, MJML).
- Do **not** import without a separate audit-only review and GO.
- Manifests already tracked are out of this import question unless a dedicated change is approved.

### Option B — RH24 full `packages/ui` source integrity review

- Cross-check all tracked UI package files (W2D-1 + W2D-1R + manifests/config) for consistency, exports, and residual i18n guardrails (`SkipToMainLink` English default).
- Useful before broader consumers adopt `@confora/ui` barrel.

## Explicitly not recommended

- Direct import of notification template sources without audit-only review.
- Broad `git add packages/` / `git add packages/ui/`.
- Mixing apps / frontend-app / scripts / terraform / auth / database / AI packages into the next wave.
