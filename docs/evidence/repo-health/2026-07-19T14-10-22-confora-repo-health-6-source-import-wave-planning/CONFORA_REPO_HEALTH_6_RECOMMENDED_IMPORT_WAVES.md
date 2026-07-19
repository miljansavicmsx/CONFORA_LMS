# CONFORA-REPO-HEALTH-6 — Recommended import waves

Seven waves. Each uses **explicit path groups** — never broad `git add apps` / `git add frontend-app` / `git add docs`.

| Wave | Name | Path group logic | Approx size | Risk |
|------|------|------------------|-------------|------|
| **W1** | App + compose config manifests | Explicit files: `apps/api/{package.json,nest-cli.json,tsconfig*.json,jest*.cjs}`; `frontend-app/{package.json,vite.config.ts,tsconfig*.json,index.html,postcss.config.js,tailwind.config.js,.env.example}`; `docker-compose.yml`; `docker-compose.a11y-ci.yml`; `.cursorignore` | ~20 files | Low (spot-check `.env.example`) |
| **W2** | Shared packages | `packages/shared-types/**`, `packages/shared-kernel/**`, `packages/config/**`, `packages/ui/**`, then `packages/database/**` (no secrets); defer `packages/auth` if secret-bearing | ~100–150 | Low–med |
| **W3** | API core + education | `apps/api/src/{common,config,types,health}/**` + education/LMS: `lms/**`, `course-*/**`, learner `dashboard/**` (not cert) | ~80–120 | Med (boundary) |
| **W4** | API auth/security/tenant/prisma | Only after high-risk review: `apps/api/src/{auth,security,tenant,prisma}/**` | ~50 | **High** |
| **W5** | API certification (split commits inside wave) | Applications/eligibility/exam modules → **decision** → **issuance/lifecycle/wallet** → appeals **then** complaints → `verify/**` | ~450 | High (SoD) |
| **W6** | Frontend shell → domains | `frontend-app/src/{lib,layouts,hooks,design-system,components}/**` then education pages then certification pages (same SoD splits) | ~700 | Med–high |
| **W7** | Tests, ops, curated evidence | `apps/api/test/**`; `frontend-app/e2e/**`; `scripts/ops/**` excluding MFA until reviewed; evidence: **markdown+json only** per approved folder | tests+ops ~330; evidence curated | Med |

## Optional later (not in the 7)

- `infra/`, `infrastructure/`, `terraform/` as IaC wave after app source
- Root planning `.docx`/`.pdf` packs (owner decision)
- `docs/architecture`, `docs/governance`, `docs/implementation` as docs-only commits
- `backend/`, `frontend-public/` only after product-owner classification

## Commit hygiene

- One wave → one or few commits with **explicit paths**
- Prefer `git add path1 path2 …` lists recorded in the follow-up task evidence
- No `git add .`
