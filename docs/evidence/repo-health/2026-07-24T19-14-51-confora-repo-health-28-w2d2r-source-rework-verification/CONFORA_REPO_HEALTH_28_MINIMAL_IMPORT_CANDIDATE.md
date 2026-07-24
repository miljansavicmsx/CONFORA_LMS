# CONFORA-REPO-HEALTH-28 — Minimal Import Candidate

## Recommended minimal first import (controlled future task)

1. `packages/notification-templates/src/escape.ts`
2. `packages/notification-templates/src/subjects.ts`
3. `packages/notification-templates/src/index.ts`
4. `packages/notification-templates/src/escape.test.ts`
5. `packages/notification-templates/src/subjects.test.ts`
6. `packages/notification-templates/src/index.test.ts`

## Second slice (after minimal GO)

- `packages/notification-templates/src/events.ts`
- `packages/notification-templates/src/events.interpolate.test.ts`

Guardrail: do **not** import `templates/**` with either slice. Loader remains callable only when MJML exists on disk; git import of MJML stays deferred.

## Already tracked (do not re-import)

- `packages/notification-templates/src/event-keys.ts`
