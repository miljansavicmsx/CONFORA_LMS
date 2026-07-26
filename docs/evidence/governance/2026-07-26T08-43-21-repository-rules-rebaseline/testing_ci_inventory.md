# Testing and CI Inventory

**Headline: all 8 CI workflows are tracked, and all 8 are broken on a fresh clone because they reference untracked paths. The majority of real test coverage is untracked.**

---

## 1. Unit tests — **VERIFIED**

| Area | Framework | On disk | Tracked |
|------|-----------|--------:|--------:|
| `apps/api/src/**/*.spec.ts` | Jest | 3 | **3** |
| `apps/worker/src/**/*.spec.ts` | Jest | 2 | 0 |
| `packages/*` | `tsx --test` / Jest / `node:test` | ~12+ | **12** |
| `frontend-app/src/**` | Vitest | 123 | **14** |
| `backend/tests/test_*.py` | pytest | **115** | **0** |
| `scripts/ops/*.test.mjs` | `node --test` | 19 | 2 |
| `packages/database/test/*.test.ts` | `tsx --test` | 3 | 0 |

Tracked examples: `apps/api/src/auth/actor-db-access.spec.ts`, `resolve-db-user.spec.ts`, `cert-wallet/me-certificates.service.spec.ts`; `packages/shared-kernel/src/tenant.test.ts`; `packages/config/eslint-rules/no-inline-script-without-nonce.test.mjs`.

**Orphan-test finding (CONTRADICTED).** `packages/notification-templates` and `packages/ai-prompts` contain TRACKED `*.test.ts` files but declare **no `test` script** in `package.json`. `turbo test` will never run them — they are tracked coverage that CI cannot see.

## 2. Integration tests — **PARTIALLY VERIFIED (config tracked, suites absent)**

| Item | Status |
|------|--------|
| `apps/api/jest.integration.config.cjs` (`testRegex: 'test/integration/.*\.integration-spec\.ts$'`) | **TRACKED** |
| `apps/api/test/integration/**` | **NOT FOUND on disk** |
| `packages/database` DB tests | UNTRACKED |
| `backend/pytest.ini` `integration` marker | UNTRACKED |

A tracked Jest config points at a directory that does not exist.

## 3. E2E tests — **VERIFIED; Cypress NOT FOUND**

| Suite | Framework | On disk | Tracked |
|-------|-----------|--------:|--------:|
| `frontend-app/e2e/**/*.spec.ts` | Playwright | 62 | **8** |
| `tests/e2e/**/*.spec.ts` (a11y / ISO 17024 compliance) | Playwright | 24 | **0** |
| `apps/api/test/*.e2e-spec.ts` | Jest + supertest | 2 | **2** |
| Cypress | — | 0 | — |

Tracked Nest e2e: `td-082-pilot-certificant-wallet.e2e-spec.ts`, `appeals-complaints-1-boundary.e2e-spec.ts`. The entire ISO 17024 compliance E2E suite (`tests/e2e/compliance/iso17024_*.spec.ts`) is untracked.

## 4. Tenant-isolation tests — **VERIFIED (thin tracked coverage)**

See `tenant_isolation_inventory.md` §5. Tracked: `actor-db-access.spec.ts`, `td-082` e2e wrong-tenant 403, `tenant.test.ts`, `run-td-083-tenant-negative-api.mjs`. Untracked: `backend/tests/test_tenant_*.py`, `test_dashboard_tenant_scope.py`.

## 5. RBAC and SoD tests — **VERIFIED on disk; mostly UNTRACKED**

All substantive SoD and RBAC testing is in the untracked Python suite:

- SoD: `backend/tests/test_sod_policy.py`, `test_sod_api_endpoints.py`, `test_recertification_sod.py`
- RBAC/ABAC: `test_p0_rbac_hardening.py`, `test_rbac_policy_p1.py`, `test_abac_*.py`, `test_authorization_engine.py`, `test_resource_authorization.py`

Frontend RBAC tests (`rbac-api-1-frontend-alignment.test.ts`, `certification-decision-access.test.ts`) are untracked Vitest files.

Only `apps/api/test/appeals-complaints-1-boundary.e2e-spec.ts` (TRACKED) exercises role boundaries.

**This directly conflicts with `.cursor/rules/07-testing.mdc`,** which mandates tests for RBAC, certification workflow, assessment workflow, AI governance, audit logging, API validation and tenant isolation. In the tracked tree, most of that mandate is unmet.

## 6. Security checks — **PARTIALLY VERIFIED**

| Control | Finding |
|---------|---------|
| Dependency audit | `frontend-app/package.json` → `"security:check": "npm audit --audit-level=high"`, used only by `release-candidate.yml` |
| Dependabot | **NOT FOUND** (`.github/dependabot.yml` absent) |
| CodeQL / SAST | **NOT FOUND** |
| Secret scanning in CI | **NOT FOUND** — secret-scan results exist only as evidence documents |
| CSP | `tests/e2e/csp-vs-a11y.spec.ts`, `frontend-app/vite-csp-preview.mjs` (UNTRACKED); a11y workflow sets `CSP_MODE` |
| OWASP ZAP | `confora-qa.yml` optional `zaproxy/action-baseline` |
| Security docs | `docs/SECURITY.md`, `docs/SECURITY_HARDENING.md` (UNTRACKED) |

For a platform claiming ISO/IEC 27001 alignment, the absence of any tracked automated secret scanning, SAST or dependency-update automation is a material gap.

## 7. CI workflows — **all 8 TRACKED, all 8 BROKEN ON FRESH CLONE**

| Workflow | Trigger | Key steps | Referenced paths tracked? | Fresh-clone executable? |
|----------|---------|-----------|---------------------------|-------------------------|
| `ci.yml` | push `main`/`master`/`develop`, PR | lint/typecheck/test; Jest e2e; pdf-pades jest; `pnpm build`; Prisma migrate+seed+test in `packages/database`; compliance jest; Docker build `infra/docker/Dockerfile.{api,web,admin}` | **No** — `packages/database`, Dockerfiles, `apps/web`, `apps/admin` untracked; pdf-pades and compliance suites missing on disk | **BROKEN** |
| `backend-tests.yml` | push/PR `backend/**` | `pip install` + `pytest tests/` in `backend/` | **No** — all of `backend/` untracked | **BROKEN** (path filter also never fires) |
| `backend-nightly.yml` | schedule + dispatch | full pytest; `scripts/validate_deployment_env.py` | **No** | **BROKEN** |
| `confora-qa.yml` | dispatch | `@confora/database` generate; `@confora/api` test + compliance; `@confora/worker` test; optional ZAP | **No** — database and worker untracked | **BROKEN** |
| `accessibility.yml` | push/PR/schedule/dispatch | Prisma; build api/web/`frontend-app`; Playwright in `tests/e2e`; `tools/a11y`, `scripts/a11y/*`; compose mounts `backend/` | **No** — `tests/e2e`, `tools/`, `scripts/a11y`, `backend/`, `frontend-app/package-lock.json` untracked | **BROKEN** |
| `deploy-backend.yml` | push main/tags | bundle `backend/` → Lambda `confora-lms-api` | **No** | **BROKEN** |
| `f4-frontend-cutover-gate.yml` | push/PR path filters | `frontend-app` npm install + Playwright; `run-f4-8g-frontend-validation.mjs` | **No** — validation/audit scripts and most e2e specs untracked; `package-lock.json` untracked | **BROKEN** |
| `release-candidate.yml` | dispatch | backend pytest; frontend `npm ci` + test/build/lint/`security:check` | **No** | **BROKEN** |

**Partial nuance on `ci.yml`:** the `quality` job's lint/typecheck/test steps may partially succeed for tracked workspace packages, but the `database` and `docker` jobs in the same workflow fail, so the workflow as a whole cannot pass.

**`deploy-backend.yml` is the highest-severity item:** it is configured to deploy to production (`api.confora.io`) on every push to `main`, from a directory that does not exist in the repository.

Also notable: `accessibility.yml` and `f4-frontend-cutover-gate.yml` run `npm ci` against `frontend-app/package-lock.json`, which is **gitignored** (`.gitignore` ignores `package-lock.json`).

## 8. Lint and type-check — **VERIFIED**

| Item | Path | Status |
|------|------|--------|
| Root scripts | `package.json`: `"lint": "turbo lint"`, `"typecheck": "turbo typecheck"`, `"format": "prettier --check ."` | TRACKED |
| Turbo pipeline | `turbo.json`: `lint`, `typecheck` (`dependsOn: ["^build"]`), `test`, `build` | TRACKED |
| ESLint | `eslint.config.mjs` → `createConforaEslintConfig` from `@confora/config/eslint` | TRACKED |
| Prettier | `prettier.config.cjs`, `.prettierignore` (ignores `backend`, `frontend-app`) | TRACKED |
| Husky | `.husky/pre-commit` (lint-staged + `pnpm typecheck`), `.husky/commit-msg` (commitlint) | TRACKED |
| Commitlint | `commitlint.config.cjs` — conventional commits | TRACKED |

This is the healthiest area: the quality tooling chain is complete and fully tracked.

## 9. Build commands — **VERIFIED**

| Scope | Command | Note |
|-------|---------|------|
| Root | `pnpm build` → `turbo build` | TRACKED |
| Turbo | `build.dependsOn: ["^build"]`, outputs `dist/**`, `.next/**` | TRACKED |
| `@confora/api` | `nest build --builder tsc` | tracked package, ~10 src files |
| `frontend-app` | `tsc -b && vite build` | **outside the workspace** — not reachable by turbo |
| `@confora/database`, `@confora/worker`, `apps/web`, `apps/admin` | prisma/nest/next builds | untracked packages |

## 10. Repository-health scripts — **VERIFIED, UNTRACKED**

| Path | Role |
|------|------|
| `scripts/ops/_tmp-repo-health-3-classify.mjs` | classifies untracked sources, writes to `docs/evidence/repo-health/` |
| `scripts/ops/_tmp-repo-health-3-emit.mjs` | emit helper |
| `scripts/ops/_tmp-repo-health-4-analyze.mjs` | workspace meta classification |
| `scripts/ops/_tmp-repo-health-4-emit.mjs` | emit helper |

All untracked. Header: `CONFORA-REPO-HEALTH-3 — local analysis helper (audit only; not a product feature).`

Validation scripts `validate_deployment_env.py`, `release_check.py`, `pilot_check.py`, `ga_check.py`, `deploy_confidence_check.py`, `audit_backend_route_guards.py` — all UNTRACKED, yet `backend-nightly.yml` invokes one of them.

**Irony worth recording:** the tooling that documents the untracked-source problem is itself untracked.

---

## Testing/CI posture

On a fresh clone, automated quality reduces to: 3 Nest unit specs, 2 Nest e2e specs, ~12 package unit tests, ~14 frontend Vitest files, 8 Playwright specs, a few `node --test` helpers, plus lint/typecheck/prettier/husky/commitlint. Everything else — 115 pytest files, the RBAC/SoD/tenant suites, 100+ Vitest files, 54 additional Playwright specs, the ISO 17024 compliance suite, and all DB/integration/compliance Jest suites — exists only as untracked working-tree files.

**No CI workflow can currently pass on a fresh clone.**

## Contradictions and gaps

1. CI assumes a full monorepo (`backend`, `packages/database`, Nest compliance/integration, Docker images) that is not in git.
2. Tracked Jest configs (`jest.integration.config.cjs`, `jest.compliance.config.cjs`) target directories that do not exist.
3. CI references specific missing tests: `pdf-pades.sign`, `gov/risks/risks.compliance.spec.ts`, `scheme-public-722`, `iso17024_3_22_fairness_artifacts`.
4. Orphan tracked tests in `ai-prompts` and `notification-templates` (no `test` script).
5. Dual stacks: the untracked FastAPI tree holds most RBAC/SoD/security tests while the sparse tracked Nest app holds little; CI still mixes both.
6. `frontend-app` — the primary UI — sits outside the workspace, so root `pnpm test` skips it; CI uses a separate `npm ci` against a gitignored lockfile.
7. No tracked Dependabot, CodeQL or secret-scanning workflow despite evidence documents describing scans.
8. Repo-health tooling is untracked.
9. `deploy-backend.yml` targets production from a non-existent directory on every push to `main`.
