# CONFORA-REPO-HEALTH-25 — Minimal Import Candidate

## Recommended minimal first import (after findings review / separate import task)

Exactly **one** file:

1. `packages/notification-templates/src/event-keys.ts`

## Why this subset

- Matches existing package export `./event-keys` intent (browser-safe clients).
- No filesystem, network, interpolation, or MJML coupling.
- Preserves workflow boundary taxonomy without shipping unsafe loader.

## Explicitly excluded from first import

- `src/events.ts`
- `src/index.ts` (until it exports keys-only or events is remediated)
- All `templates/**`

## Next after keys import (future)

1. Rework `events.ts` (escape + locale subjects + avoid sync fs in shared entry, or split Node-only loader).
2. Fix barrel.
3. Localize HR MJML (or stop claiming bilingual).
4. Re-audit (RH26-class) then consider MJML import.
