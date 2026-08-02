# Architecture decision — R0-7D2S1

## Decision ID

`A11Y_PUBLIC_ENTRY_SEPARATION`

## Status

**PROPOSED — awaiting owner authorization of justified closure count**

## Context

1. Production `frontend-app/src/main.tsx` imports `App.tsx`.
2. `App.tsx` **statically** imports large authenticated/admin/learner graphs (guards, dashboards, ISO pages, etc.), with only some public pages using `lazy()`.
3. Vite production build and `tsc` against `App.tsx` therefore require hundreds of modules even when axe only visits three public URLs.
4. R0-7D2R “solved” this by promoting ~731 `frontend-app/src` files + committing generated `packages/ui/dist/styles.css` + dropping `tsc` from `build`. Independent review: **NO-GO**.

## Decision

Future accessibility baseline CI MUST NOT build the full production `App.tsx` graph until that graph is intentionally tracked and typecheck-clean.

Instead, introduce a **dedicated public baseline entry** used only by accessibility CI:

| Artifact (future impl; not created here) | Role |
|------------------------------------------|------|
| `index.a11y.html` (or Vite `build.rollupOptions.input`) | HTML entry |
| `src/main.a11y.tsx` | Providers (`ConforaI18nProvider`, QueryClient) + mount |
| `src/App.a11y.tsx` | Router with **only** `/`, `/login`, `/verify` (+ optional `/verify/:hash`) |
| `tsconfig.a11y.json` | `include` = explicit justified file list (closure + entry) |
| `vite.a11y.config.ts` | Builds a11y entry; may alias packages from **source** |

Product `App.tsx` **keeps** deferred routes (`/contact`, `/pricing`, `/faq`, …). They are not removed; they are simply outside the a11y entry.

## Clean-checkout gate (preferred)

```text
npm ci
npm run typecheck:a11y    # tsc -b -p tsconfig.a11y.json (truthful, scoped)
npm run build:a11y        # vite build -c vite.a11y.config.ts
preview a11y dist
playwright axe on /, /login, /verify
```

Optional later product gate (full app) remains separate and must not be pretended by the a11y job.

## Alternatives considered

| Option | Verdict |
|--------|---------|
| Promote full `frontend-app/src` again | **Rejected** (owner + review) |
| Keep full `App.tsx` but narrow `tsconfig.include` while Vite still parses App | **Unsafe** — Vite still needs unresolved static imports |
| Convert all non-baseline routes to `lazy()` inside production App only | Possible long-term hygiene; **not sufficient alone** without tracking or stubs for every static import today |
| vite-only build without typecheck | **Rejected** (owner §2.5) |

## Package / CSS decision companion

`PACKAGE_SOURCE_RESOLVE_WITH_EPHEMERAL_CSS_BUILD`

- Resolve `@confora/i18n` / `@confora/ui` from **tracked TypeScript source** (no committed `dist/**` JS).
- Do **not** track `packages/ui/dist/styles.css`.
- Before `build:a11y`, run an **ephemeral** CSS emit into a **gitignored** path (or generate skip-link utilities via frontend-app Tailwind `content` including `packages/ui/src/**`), then consume that path from Vite aliases.
- Never force-add generated CSS.
