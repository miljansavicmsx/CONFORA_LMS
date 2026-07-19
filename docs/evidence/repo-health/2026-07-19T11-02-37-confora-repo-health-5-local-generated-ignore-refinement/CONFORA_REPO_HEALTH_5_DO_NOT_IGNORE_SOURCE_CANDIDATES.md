# CONFORA-REPO-HEALTH-5 — Do not ignore (source / evidence)

## Hard exclusions from R2 proposal

| Path / class | Untracked volume (approx) | Reason |
|--------------|--------------------------:|--------|
| `apps/api/src/**` | 110 | Real Nest source candidates |
| `frontend-app/src/**` | 394 | Real frontend source candidates |
| `scripts/ops/**` (except `_tmp-repo-health-*`) | ~195 | Real ops runners / smokes |
| `packages/**` (except `*.tsbuildinfo`) | ~20 | Shared package sources |
| `docs/evidence/**` | 411 | Governance evidence — selective track, never blanket-ignore |
| `docs/**` (non-evidence) | many | Strategy/docs — owner decision, not ignore |

## Confirmation

| Guardrail | Result |
|-----------|--------|
| `docs_evidence_ignored` proposed? | **false** |
| Source directories ignored proposed? | **false** |
| Application code changed? | **false** |
| `.gitignore` modified on disk? | **false** |
