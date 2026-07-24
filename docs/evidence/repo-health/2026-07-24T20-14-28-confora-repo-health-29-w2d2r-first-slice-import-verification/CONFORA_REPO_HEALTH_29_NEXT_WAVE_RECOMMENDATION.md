# CONFORA-REPO-HEALTH-29 — Next Wave Recommendation

## Recommended next action

`REVIEW_SECOND_SLICE_EVENTS_IMPORT_GO_NO_GO`

### Second slice candidates (pending GO)

- `packages/notification-templates/src/events.ts`
- `packages/notification-templates/src/events.interpolate.test.ts`

### Remain deferred

- `packages/notification-templates/templates/**` (MJML)

Do not import MJML with the second slice. Second-slice review must re-confirm lazy Node fs, allowlisted interpolate, and no barrel export of loader via `index.ts`.
