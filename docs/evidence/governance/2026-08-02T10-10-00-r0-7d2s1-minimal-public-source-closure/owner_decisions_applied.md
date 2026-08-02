# Owner decisions applied

| Decision | Application |
|----------|-------------|
| Rejected branch status | `ci/r0-7d2-accessibility-baseline` @ `13cdd752…` classified `REJECTED_EXPERIMENTAL_NOT_PR_ELIGIBLE`; inspect-only; not used as implementation base |
| Broad source promotion | Rejected; future promotions must be per-file justified |
| Generated output | No `packages/*/dist/**`, no generated CSS in git; rejected `packages/ui/dist/styles.css` must not be carried |
| Initial routes | `/`, `/login`, `/verify` only for baseline axe |
| Deferred routes | `/contact`, `/pricing`, `/faq` remain in product App; not in a11y entry |
| TypeScript gate | Preferred semantic: `typecheck` → `vite build` |

## Process note

Planning branch created from R0-7D1 tip `f9b4a392…`, **not** from the rejected experimental tip.
