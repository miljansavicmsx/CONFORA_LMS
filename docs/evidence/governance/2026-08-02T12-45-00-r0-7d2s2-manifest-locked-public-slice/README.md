# R0-7D2S2 — Manifest-Locked Minimal Public Frontend Slice

Implementation of owner-authorized `A11Y_PUBLIC_ENTRY_SEPARATION`.

| Field | Value |
|-------|-------|
| Branch | `ci/r0-7d2s2-manifest-locked-public-slice` |
| Implementation base (R0-7D2S1 tip) | `d08ccc91f2a06ac27c56a9dd9fab6ffd46e6c7d2` |
| R0-7D1 tip | `f9b4a392c410fc6306ab57ac434196981119ce8e` |
| Integration tip | `4090be85a0f8e423d199610f82e3949c899cc90b` |
| Rejected tip (path-checkout source only) | `13cdd75280206ec00587e5455b7c76bf7d75e269` |
| Rejected classification | `REJECTED_EXPERIMENTAL_NOT_PR_ELIGIBLE` |
| Architecture | `A11Y_PUBLIC_ENTRY_SEPARATION` |
| Routes | `/`, `/login`, `/verify` (+ `/verify/:verificationHash`) |
| Promoted sources | **68** (exact S1 manifest) |
| Operational extras | **10** |
| Cumulative operational files | **78** (ceiling) |
| Pull request | **not opened** |

## Gates

| Gate | Result |
|------|--------|
| `npm run typecheck:a11y` | PASS |
| `npm run build:a11y` | PASS (`dist-a11y/`, gitignored) |
| Preview `/` `/login` `/verify` | HTTP 200 SPA shell |
| Production `main.tsx` / `App.tsx` | **unchanged** |
| Package `dist` tracked | **no** |
| Axe / GHA a11y workflow / remediation | **out of scope** |

## Package strategy

- `@confora/i18n` / `@confora/ui` resolved from package **source** via Vite/tsconfig aliases
- Ephemeral Tailwind CSS emit to gitignored `packages/ui/dist/styles.css` during `build:a11y`
- No package.json export-contract rewrites
- No package-local tsconfig duplication for contracts

## Known deliberate bound

`nest-auth-pilot.ts` no longer imports `sidebar-sections` (out of closure). Role-aware staff pilot sidebars temporarily resolve to the learner section set so the a11y typecheck graph remains manifest-locked.
