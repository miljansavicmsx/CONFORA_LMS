# CONFORA-REPO-HEALTH-36 — Source Review

## `src/create-i18n.ts`

| Check | Result |
|-------|--------|
| Network/provider calls | **none** (pure i18next `createInstance().init`) |
| Tenant routing | **none** |
| RBAC/SoD logic | **none** |
| Workflow decision logic | **none** |
| Unsafe eval/`Function` construction | **none** |
| Hidden browser/server side effects | **none** (creates isolated instance; no globals) |
| Note | `interpolation.escapeValue: false` — standard for React (React escapes). Acceptable; keys/values are bundled static copy, not untrusted input. |

## `src/index.ts`

Safe barrel only — re-exports keys, resources, `createConforaI18n`, types. No runtime integration, no app coupling. **PASS**

## `src/keys.ts`

Namespace + `SUPPORTED_LOCALES` (`en,bs,sr,hr,sl`) + `A11Y_KEYS` + `LOCALE_STORAGE_KEY` (display-only localStorage key, documented "no API/auth impact"). No business/tenant/auth/workflow logic. **PASS**

## `src/react.tsx`

`'use client'`; `ConforaI18nProvider` wraps `I18nextProvider`; `A11ySkipToMainLink` wraps `@confora/ui` SkipToMainLink with translated `a11y:skip_to_main`. No network, no tenant routing, no auth/RBAC side effects. Peer coupling to closed `@confora/ui` only (no lockfile change needed). **PASS**

## `src/resources.ts`

Static `import ... with { type: 'json' }` of all 40 locale files, aggregated deterministically via `Object.fromEntries`. No dynamic/remote loading, no fs/network at runtime (the only `node:fs` use is in the **test**, not src). Deprecated `a11yResources` retained for back-compat. **PASS**

## Verdict

`source_review_pass: true` — all five source files clean.
