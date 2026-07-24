# CONFORA-REPO-HEALTH-27 — Index Export Review

**File:** `packages/notification-templates/src/index.ts` (untracked)

```ts
export * from './event-keys';
export * from './events';
```

| Check | Result |
|-------|--------|
| Exposes `events.ts` | **yes** |
| Would expose unsafe `interpolate` / Node loader | **yes** |
| Would pull deferred MJML dependency path | **yes** (via loader) |
| Side effects at import | none beyond re-export graph |
| Split export needed | **yes** — keys already available via tracked `event-keys` + package `./event-keys` export |

## Required index rework options

1. **Keep excluded** until `events.ts` passes escaping/i18n verification.
2. **Split:** root/barrel exports keys-only; Node loader on a separate entry (e.g. `./node` or `./load`) that is not the default package export.

## Current recommendation

**NO-GO** — do not approve barrel that exposes unreworked renderer/loader.
