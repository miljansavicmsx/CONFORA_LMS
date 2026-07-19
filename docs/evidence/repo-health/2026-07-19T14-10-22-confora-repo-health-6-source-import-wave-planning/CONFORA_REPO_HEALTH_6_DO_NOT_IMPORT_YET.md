# CONFORA-REPO-HEALTH-6 — Do not import yet

| Item | Reason |
|------|--------|
| `docs/evidence/**` bulk (~102k files) | Dominated by smoke screenshot/dump trees (e.g. 16k+ in one folder). Import **curated** markdown/`summary.json` only later |
| Evidence folders with >500 files each | e.g. `p1-b10-4-certification-decision-smoke`, `p1-b4-c-submit-smoke`, `f5-ui`, `ui-shell`, `local-uat`, … |
| `backend/**` | Legacy/non-primary tree; classify with product owner first |
| Root `*.docx` / large `*.pdf` planning packs | Owner decision; not needed for build |
| `scripts/ops/*mfa*` / `*keycloak*` with otpauth hits | High-risk review incomplete |
| Auth/JWT/tenant/prisma source | Wait for Wave 4 after review |
| Full `frontend-app/src` or `apps/api/src` in one add | Too broad; SoD and review risk |
| `frontend-public/**`, root `tests/**` | Classify relative to primary `frontend-app` / `apps/api` first |
| Anything matching existing ignore (locks stubs, build logs, `_tmp-repo-health-*`, `*.tsbuildinfo`) | Stay local/generated |

## Guardrails

- Do not hide these with new ignore rules (except already-approved generated patterns)
- Do not weaken domain boundaries while importing
- Do not claim external pilot / security / DPO / legal approval
