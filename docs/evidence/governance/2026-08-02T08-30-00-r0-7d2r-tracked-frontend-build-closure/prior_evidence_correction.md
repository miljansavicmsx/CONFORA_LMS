# Correction of R0-7D2 evidence honesty (HIGH finding)

The prior evidence folder
`docs/evidence/governance/2026-08-02T06-45-00-r0-7d2-accessibility-baseline/`
did **not** truthfully record the independent-review CRITICAL outcome.

## What R0-7D2 actually failed to prove (now recorded)

| Claim area | Truthful status at R0-7D2 evidence tip `5ef2ad5f` |
|------------|-----------------------------------------------------|
| Clean tracked `npm run build` | **FAILED** (exit 1) — large untracked `frontend-app/src` modules + unresolved `file:` package dist |
| Local preview | **DID NOT EXECUTE** (blocked by build failure) |
| Playwright axe suite | **DID NOT EXECUTE** (blocked by build/preview) |
| Violation count | **NOT AVAILABLE** |
| GitHub-hosted accessibility job | **DID NOT OCCUR** for this baseline (no Draft PR / no claimed GHA run) |

## What R0-7D2R now proves (local clean worktree)

| Claim area | Status |
|------------|--------|
| Clean tracked `npm ci` | PASS |
| Clean tracked `npm run build` | PASS |
| Local preview | PASS |
| Route readiness | PASS for `/`, `/login`, `/verify`, `/contact`, `/pricing`, `/faq` |
| Playwright discovery | PASS (6 tests) |
| axe execution + JSON reports | PASS (executed; reports under `axe-reports/`) |
| Zero WCAG_2_2_AA_AUTOMATED_SUBSET violations | **FAIL** — violations present (see `validation.md`) |
| GitHub-hosted execution | **NOT CLAIMED** |

Prior R0-7D2 evidence files are retained for audit; this package supersedes their implied executability claims.
