# CONFORA-REPO-HEALTH-33 — Source Compatibility Review

## Allowlist

Tracked `events.ts` defines:

```ts
MJML_TEMPLATE_VAR_KEYS = ['heading', 'bodyText', 'footer']
```

Imported EN MJML placeholders are exactly that set → `compatible_with_events_allowlist: true`.

## Fail-closed behavior (unchanged; not modified by import commit)

- `interpolateMjmlAllowlisted` rejects unknown / missing vars; HTML-escapes values; rejects leftover `{{…}}`.
- Legacy `interpolate()` throws (never interpolates).
- `loadBundledEmailTemplate` fails safely when MJML missing (HR still absent from tree tracking).
- Commit `68a32acd` touched **no** `src/**` files.

## Barrel / packaging

| Check | Result |
|-------|--------|
| `index.ts` exports loader/render/interpolate | **no** (event-keys, escape, subjects only) |
| Import required `index.ts` change | **false** |
| Import required `package.json` / lockfile / workspace change | **false** |

Public package surface unchanged.
