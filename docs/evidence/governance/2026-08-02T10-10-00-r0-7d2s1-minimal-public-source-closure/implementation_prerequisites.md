# Implementation prerequisites (next task — not this one)

Do **not** implement until owner authorizes:

1. `A11Y_PUBLIC_ENTRY_SEPARATION`
2. `FRONTEND_JUSTIFIED_CLOSURE_OWNER_AUTHORIZATION_REQUIRED` for ≈68 newly promoted files (+ entry/config)
3. `PACKAGE_SOURCE_RESOLVE_WITH_EPHEMERAL_CSS_BUILD` (or app-Tailwind variant)
4. Axe route set = `/`, `/login`, `/verify` only
5. Clean gate = `typecheck:a11y && build:a11y`

## Suggested implementation base

`f9b4a392c410fc6306ab57ac434196981119ce8e` (or integration `4090be85…` + cherry-pick only approved R0-7D2 **workflow/axe** bits from `9e5aa70e…` after review)

**Not** `13cdd752…`.

## Per-file promotion checklist (mandatory)

For each path in `closure/files-to-promote.txt`:

- [ ] Import-closure justification (why reachable from a11y entry)
- [ ] Canonical path (no duplicate module)
- [ ] Provenance (exists on rejected tip / working tree; not newly invented unless required entry)
- [ ] Duplicate search across `apps/web`, `apps/admin`, packages
- [ ] Security review (no secrets, no demo passwords, no unsafe HTML sinks introduced)
- [ ] Generated vs source classification (source only)

## Non-goals of next implementation

- Fix color-contrast / select-name / aria-hidden-focus (R0-7D3+)
- Promote full `frontend-app/src`
- Track package dist
- Open Draft PR before green justified gate + owner scope approval
