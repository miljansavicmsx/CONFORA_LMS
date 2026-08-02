# Minimal import closure analysis

## Method

Static import/export + dynamic `import()` walk over candidate sources inspected from rejected tip `13cdd752…` (read-only). Seeds for the three-route **page** closure intentionally **exclude** `main.tsx` / `App.tsx` to model `A11Y_PUBLIC_ENTRY_SEPARATION`.

## Why full App is impossible for a minimal slice

Walk including `main.tsx` → `App.tsx` expands to **≈545** `frontend-app` modules (admin/learner/iso/static imports). That matches the R0-7D2R failure mode.

## Three-route page closure (/, /login, /verify + verify hash page)

| Metric | Value |
|--------|------:|
| Modules in closure | **75** |
| Already tracked at R0-7D1 (`f9b4a392`) | **7** |
| Still untracked / need per-file promote | **68** |
| Includes `App.tsx` / `main.tsx` | **No** |
| `@confora/*` externals observed | `@confora/i18n` (entry will also need `@confora/i18n/react`, `@confora/ui`) |

### Already tracked (7)

See `closure/files-already-tracked-at-d1.txt`.

### Need per-file promotion (68)

See `closure/files-to-promote.txt`.

Notable clusters:

- `components/ui/*` (button, card, input, label, badge, tabs, ConforaLogo)
- `components/entity-relations/**` (pulled by `VerifyLookupPage`)
- `lib/entity-relationships/**` + `workflow-registry-snapshot.json`
- `lib/api*` / auth-client / http-client (login + verify)
- `lib/*-access.ts` chain via `stores/authStore` → `authorization`
- `pages/public/LandingPage.tsx`, `VerifyCertificate.tsx`
- a11y shell helpers (`AppShellFallback`, optional `LandmarkDevAudit`)

Machine-readable: `closure/three-route-page-closure.json`.

## Deferred routes incremental cost

Adding Contact + Pricing + SimpleContentPage (FAQ) to the **same page-closure walk** adds **only 5 files**:

- `pages/public/ContactPage.tsx`
- `pages/public/PricingPage.tsx`
- `pages/public/SimpleContentPage.tsx`
- `components/ui/checkbox.tsx`
- `lib/api-onboarding.ts`

### Recommendation on deferred routes

**Keep deferred** for the initial baseline despite small source delta:

- Owner §2.4 sets initial axe scope to three routes.
- Extra routes expand axe surface (R0-7D2R already showed `/pricing` `select-name`, `/faq` contrast, `/contact` contrast).
- “No material source dependency” is **true for raw file count (+5)**, but **not** sufficient to override the explicit initial-route decision.

Do **not** delete deferred routes from production `App.tsx`.

## Optional future shrink (not required to start)

| Lever | Effect |
|-------|--------|
| Omit `LandmarkDevAudit` from a11y entry | Drops audit helper modules |
| Slim `VerifyLookupPage` away from entity-relations | Large reduction; requires deliberate UX/product change + SoD/trust review |
| Narrow authStore authorization fan-out for login-only | Requires careful auth boundary design |

## Scope ceiling conflict

Prior review ceiling: max **24** promoted frontend source files / **30** operational files.

Justified three-route closure alone needs **≈68 newly promoted** source files (+ new entry/config files).  

Classification for next implementation:

`FRONTEND_JUSTIFIED_CLOSURE_OWNER_AUTHORIZATION_REQUIRED`

(Equivalent intent to prior `FRONTEND_SLICE_SCOPE_OWNER_DECISION_REQUIRED`, but framed as **authorize justified import closure**, not directory dump.)
