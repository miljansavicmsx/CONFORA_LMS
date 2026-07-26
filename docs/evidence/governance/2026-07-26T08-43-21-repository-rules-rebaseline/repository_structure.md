# Repository Structure

**Classification: VERIFIED**

The central structural fact: **1404 files are tracked** while **1439 untracked entries** exist at the top level of `git status`. Tracked and on-disk topologies differ substantially, and every governance conclusion must state which one it refers to.

## Tracked top-level distribution

| Top-level path | Tracked files |
|----------------|--------------:|
| `docs` | **1087** |
| `packages` | 131 |
| `frontend-app` | 108 |
| `scripts` | 31 |
| `apps` | **20** |
| `.github` | 8 |
| `.husky` | 2 |
| Root config files (each 1) | 16 |

Root config files tracked: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `turbo.json`, `eslint.config.mjs`, `prettier.config.cjs`, `commitlint.config.cjs`, `.gitignore`, `.cursorignore`, `.editorconfig`, `.prettierignore`, `.env.example`, `.lighthouserc.json`, `docker-compose.yml`, `docker-compose.a11y-ci.yml`, `README.md`, `AGENTS.md`.

## Directories on disk but largely or wholly untracked

| Directory | Tracked | On-disk untracked (approx.) | Note |
|-----------|--------:|----------------------------:|------|
| `backend/` | **0** | ~338 | FastAPI legacy stack, full implementation |
| `frontend-public/` | **0** | ~72 | Next.js marketing site |
| `infra/` | **0** | ~33 | Docker/Keycloak/staging infra |
| `infrastructure/` | **0** | ~39 | Terraform (Cognito/DynamoDB/Lambda) |
| `terraform/` | **0** | — | Second Terraform tree |
| `tests/` | **0** | ~58 | Playwright a11y/ISO compliance suite |
| `tools/` | **0** | ~5 | a11y tooling |
| `prisma/` | **0** | 1 | Deprecated monolith schema |
| `services/` | **0** | 0 | **Empty on disk** despite being referenced as legacy |

## `apps/` — tracked vs on disk

| App | Tracked files | On disk | Status |
|-----|--------------:|:-------:|--------|
| `apps/api` | **20** | yes | NestJS, designated canonical API — source largely missing |
| `apps/web` | 0 | yes | Next.js, untracked |
| `apps/admin` | 0 | yes | Next.js, untracked |
| `apps/worker` | 0 | yes | NestJS worker, untracked |
| `apps/examiner` | 0 | yes | Electron, untracked |
| `apps/ai-service` | 0 | yes | untracked |

## `packages/` — tracked counts

| Package | Tracked | Assessment |
|---------|--------:|------------|
| `packages/i18n` | 50 | closed (RH37–38) |
| `packages/notification-templates` | 15 | closed source + EN MJML; 3 HR MJML deferred |
| `packages/config` | 13 | closed |
| `packages/ui` | 11 | closed |
| `packages/ai-prompts` | 10 | closed (RH39–41) |
| `packages/shared-kernel` | 9 | closed |
| `packages/shared-types` | 8 | closed |
| `packages/sdk` | 5 | closed |
| `packages/audit-client` | 5 | closed (RH14–15) |
| `packages/ai-client` | 5 | closed source subset (RH45–46) |
| `packages/database` | **0** | ~125 on disk — **highest-risk untracked package** |
| `packages/ai-governance` | 0 | `README.md` stub only |
| `packages/audit` | 0 | `README.md` stub only |
| `packages/auth` | 0 | `README.md` stub only |
| `packages/types` | 0 | `README.md` stub only |

Ten packages are tracked and closed; one substantial package (`database`) is entirely untracked; four are README-only stubs.

## Workspace wiring

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Finding (VERIFIED):** `frontend-app/` — 108 tracked files, the CI-gated and acceptance-signed pilot UI — is **outside the pnpm workspace**. It consumes packages via `file:`/`workspace:` references but is not a workspace member, so root `pnpm test` / `turbo` tasks do not reach it. `frontend-public/` declares `"@confora/i18n": "workspace:*"` while also sitting outside the workspace, which is an install inconsistency.

## `docs/` — tracked vs on disk

On-disk `docs/` subdirectories:

```text
accessibility  architecture  design-system  evidence  governance
implementation  legal  planning  policies  runbooks  security  testing
```

Tracked `docs/` subdirectories:

```text
evidence
```

**VERIFIED:** `git ls-files docs` yields exactly one prefix — `docs/evidence` — with all 1087 files. Every other documentation tree, including `docs/governance/` and `docs/architecture/`, is untracked. See `existing_governance_inventory.md`.

## CI surface

All 8 workflows are tracked:

```text
.github/workflows/accessibility.yml
.github/workflows/backend-nightly.yml
.github/workflows/backend-tests.yml
.github/workflows/ci.yml
.github/workflows/confora-qa.yml
.github/workflows/deploy-backend.yml
.github/workflows/f4-frontend-cutover-gate.yml
.github/workflows/release-candidate.yml
```

Their executability on a fresh clone is analysed in `testing_ci_inventory.md`.

## Structural summary

The repository is best described as **three overlapping layers**:

1. **Tracked core** — evidence corpus, 10 closed packages, thin `apps/api`, partial `frontend-app`, config, CI definitions.
2. **On-disk working tree** — the actual running system: FastAPI backend, Prisma database package, full Nest source (partly only as `dist/`), Next.js apps, Terraform, test suites.
3. **Documentation layer** — governance standards and ADRs describing a target architecture, untracked.

Governance rules must state which layer they bind. A rule that assumes layer 2 will not be enforceable by CI, which sees only layer 1.
