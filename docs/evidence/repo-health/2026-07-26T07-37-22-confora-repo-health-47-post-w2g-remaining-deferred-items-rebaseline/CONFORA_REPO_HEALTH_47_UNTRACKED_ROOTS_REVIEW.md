# CONFORA REPO HEALTH 47 — Untracked Roots Review

## Untracked package roots under `packages/**`

| root | untracked files | shape | classification |
|------|:---------------:|-------|----------------|
| `packages/ai-client` | 3 | generated artifacts only (source subset already tracked) | **DO_NOT_IMPORT** (generated) |
| `packages/notification-templates` | 3 | HR MJML only | **DEFER** |
| `packages/ai-governance` | 1 | `README.md` stub | **DEFER** |
| `packages/audit` | 1 | `README.md` stub | **DEFER** |
| `packages/auth` | 1 | `README.md` stub | **DEFER** |
| `packages/types` | 1 | `README.md` stub | **DEFER** |
| `packages/database` | 75 | `package.json` + `src` + `prisma` + `node_modules` | **REVIEW_REQUIRED** (high-risk: DB/migrations) |

`packages/database` is the largest remaining untracked package and carries schema/migration/Prisma concerns plus a vendored `node_modules`. It requires a dedicated audit wave (mandatory DB rules: `created_at`/`updated_at`/`created_by`/`tenant_id`, immutability, migrations) and must not be swept in casually.

## Untracked top-level roots (repo-wide)

| root | untracked files | classification |
|------|:---------------:|----------------|
| `frontend-app` | 787 | **REVIEW_REQUIRED** (large app; dedicated wave) |
| `backend` | 338 | **REVIEW_REQUIRED** (likely legacy/parallel backend) |
| `apps` | 74 | **REVIEW_REQUIRED** (contains `apps/api`; canonical AI source restore is a separate blocked track) |
| `frontend-public` | 72 | **REVIEW_REQUIRED** |
| `tests` | 58 | **REVIEW_REQUIRED** |
| `infrastructure` | 39 | **REVIEW_REQUIRED** |
| `infra` | 33 | **REVIEW_REQUIRED** |
| `tools` | 5 | **DEFER** |
| `prisma` | 1 | **DEFER** (single file; pairs with database review) |
| loose root docs (`*.md`, `*.docx`, `*.pdf`) | — | **DEFER** (documentation; not code) |
| `terraform` | — | **REVIEW_REQUIRED** (IaC; secrets/state risk) |
| `scripts` | — | **REVIEW_REQUIRED** (ops scripts; many `.mjs`/`.py`) |

Note: `apps/api` has tracked source (clean), but the broader `apps/**`, `backend/**`, and `frontend-app/**` trees are largely untracked. Whether `backend`/`frontend-app` are legacy duplicates vs. canonical must be resolved in a dedicated reconciliation wave before any import — this echoes the RH43A lesson (findings must be grounded in canonical tracked source).

## Classification roll-up

- **CLOSED:** 10 packages (see closed-packages confirmation).
- **DO_NOT_IMPORT:** ai-client generated artifacts, any `dist`/`node_modules`/`.turbo`.
- **DEFER:** HR MJML (3), README stub roots (4), `tools`, `prisma`, loose root docs.
- **REVIEW_REQUIRED:** `packages/database`, `frontend-app`, `backend`, `apps`, `frontend-public`, `tests`, `infra`, `infrastructure`, `terraform`, `scripts`.
- **SAFE_AUDIT_NEXT:** HR MJML localization rework (smallest bounded next step).
