# CONFORA-REPO-HEALTH-24 — Next Wave Recommendation

## Recommended next action

`W2D2_NOTIFICATION_TEMPLATES_SOURCE_REVIEW_AUDIT_ONLY`

### Scope for W2D-2 (audit-only first)

Review the **9 untracked** notification-template source/template files:

- `packages/notification-templates/src/event-keys.ts`
- `packages/notification-templates/src/events.ts`
- `packages/notification-templates/src/index.ts`
- MJML under `packages/notification-templates/templates/**`

Do **not** import until that audit produces GO and a controlled import task is approved.

### Explicitly out of next uncontrolled wave

- apps / frontend-app / scripts / terraform
- packages/database / auth / ai-*
- Broad `git add packages/`
- Treating UI package as production/pilot-approved without consumer i18n compliance (RG-01)

## UI package status for sequencing

`packages/ui` integrity review is complete for current tracked inventory. No further UI source import is required for residual untracked UI files (none remain).
