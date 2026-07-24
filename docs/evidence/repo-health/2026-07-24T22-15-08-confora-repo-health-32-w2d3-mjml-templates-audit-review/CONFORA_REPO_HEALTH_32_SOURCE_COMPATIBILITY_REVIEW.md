# CONFORA-REPO-HEALTH-32 — Source Compatibility Review

| Check | Result |
|-------|--------|
| Placeholders ⊆ `heading`/`bodyText`/`footer` allowlist | **yes** → `compatible_with_events_allowlist: true` |
| `loadBundledEmailTemplate` fails safely if MJML missing | **yes** (throws after fallback chain) |
| Import requires `index.ts` change | **false** (loader not on barrel) |
| Import requires package.json / lockfile / workspace change | **false** |
| Public package surface change required | **no** |

Importing EN MJML would enable lazy loader success for those paths without packaging changes.
