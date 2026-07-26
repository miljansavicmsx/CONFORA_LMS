# Canonical and Legacy Application Inventory

Canonical status below is derived from governance documents, CI configuration, workspace wiring, imports, and deployment paths — **not** from technology names.

## Summary matrix

| Component | Designated canonical | De-facto operational | Classification |
|-----------|---------------------|----------------------|----------------|
| Backend | `apps/api` (NestJS) | `apps/api` for pilot; `backend/` still present | PARTIALLY VERIFIED |
| Frontend | `apps/web` (Next.js) | `frontend-app` (Vite) | **CONTRADICTED** |
| Admin | `apps/admin` (Next.js) | admin routes inside `frontend-app` | PARTIALLY VERIFIED |
| Legacy backend | `backend/` (FastAPI) | still on disk, deprecated | VERIFIED |
| Legacy frontend | `frontend-public/` | still wired to legacy API | PARTIALLY VERIFIED |
| Public verification | Nest `verify/*` | three implementations exist | VERIFIED (with caveats) |
| Public catalog | Nest `public/api/schemes` | three implementations exist | PARTIALLY VERIFIED |

---

## 1. Canonical backend — `apps/api` (NestJS)

**Classification: VERIFIED as designation / PARTIALLY VERIFIED as present code**

**Evidence paths**

| Path | Tracking |
|------|----------|
| `apps/api/**` | **TRACKED (20 files only)** |
| `docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md` | UNTRACKED |
| `docs/architecture/decisions/ADR-002-backend.md` | UNTRACKED |
| `docs/governance/LEGACY_STRANGLER_RETIREMENT_CRITERIA.md` | UNTRACKED |
| `docs/implementation/P0_CANONICAL_API_CUTOVER_PLAN.md` | UNTRACKED |
| `.github/workflows/ci.yml` | TRACKED |

**Evidence**

- Strangler criteria: "**NestJS API** | `apps/api/` port `4000` | **Canonical pilot authority** — all F4-9 / F5 smokes"
- Baseline §4.2: "**apps/api** as canonical API gateway … No new FastAPI backend shall be introduced for core CONFORA modules."
- ADR-002: "Primary API: `apps/api/` … Legacy `backend/` and `services/` are **frozen** pending migration."
- `ci.yml`: `pnpm --filter @confora/api exec jest --config ./jest-e2e.config.cjs`
- `apps/api/package.json`: `"name": "@confora/api"`, NestJS 10 + Prisma + JWT deps

**Critical caveat (CONTRADICTED sub-finding).** Tracked `apps/api/src/app.module.ts` imports roughly 30 modules (`./verify/verify.module`, `./ai/ai.module`, `./lms/...`, `./reports/...`, `./audit/...`). On disk, `apps/api/src/` contains only `auth`, `cert-governance`, `cert-wallet`, `prisma` plus `app.module.ts` and `schema.gql`. The imported modules exist neither on disk nor in any commit. The repository's own tracked audit confirms this:

> `docs/evidence/repo-health/2026-07-25T21-50-56-.../CONFORA_REPO_HEALTH_43A_REPORT.md` — canonical AI gateway / course-authoring / exam source **absent**; RH43 rework **blocked**.

**The designated canonical backend cannot compile from the tracked tree.**

---

## 2. Canonical frontend — CONTRADICTED

**Classification: CONTRADICTED** (two authoritative documents disagree; CI and acceptance evidence favour one)

| Path | Tracking | Role |
|------|----------|------|
| `frontend-app/**` | PARTIALLY TRACKED (108 of ~895) | Vite + React, CI-gated pilot UI |
| `apps/web/**` | **UNTRACKED** | Next.js target, minimal skeleton |
| `docs/architecture/decisions/ADR-001-frontend.md` | UNTRACKED | declares `frontend-app` frozen |
| `docs/governance/FRONTEND_CANONICALIZATION_GAP_NOTE.md` | UNTRACKED | declares `frontend-app` operational truth |
| `.github/workflows/f4-frontend-cutover-gate.yml` | TRACKED | builds **`frontend-app`** only |

**The conflict**

- ADR-001 (Accepted): "Primary app: `apps/web/` … Legacy `frontend-app/` and `frontend-public/` are **frozen** pending migration."
- Gap note (later, F6-LOCAL-2): "`frontend-app` is **operational truth** for the locked local release candidate. It is technical debt (TD-F6-01, TD-F6-14), **not deprecated for pilot**." Migration status: "**not started**."

**Tie-breaker evidence:** the only frontend CI workflow builds and tests `frontend-app` exclusively (`working-directory: frontend-app`). All frontend acceptance evidence under `docs/evidence/` targets `frontend-app` on port 3001. `apps/web` has zero tracked files and no CI.

**Conclusion:** de-jure canonical is `apps/web`; de-facto canonical is `frontend-app`. A rebaselined rule set must pick one and say so, because rules scoped to `apps/web/**` would currently govern nothing.

Also relevant: `frontend-app/src/lib/api/api-config.ts` (TRACKED) defines provider modes `legacy | nest | hybrid` with legacy `http://127.0.0.1:8000` and nest `http://localhost:4000` — the F4 cutover moved the default onto Nest.

---

## 3. Administration frontend

**Classification: PARTIALLY VERIFIED**

| Path | Tracking |
|------|----------|
| `frontend-app/src/pages/admin/AdminEducationPage.tsx`, `AdminReportsPage.tsx` | TRACKED |
| `frontend-app/e2e/admin-gov-final-acceptance-1.spec.ts` | TRACKED |
| `docs/evidence/admin-governance-final-acceptance/**` | TRACKED |
| `apps/admin/**` | **UNTRACKED** |

Admin acceptance was signed off against `frontend-app` dashboard routes. `apps/admin` exists on disk as a Next.js skeleton (`governance/`, `schemes/`, `users/`, `security/`, `ai/` pages) with no tracked files and no E2E coverage. The gap note states: "`apps/admin` | Canonical staff/admin portal | Exists; staff flows via **Nest API smokes**, not full admin Next E2E."

---

## 4. Legacy backend — `backend/` (FastAPI) — **VERIFIED**

| Path | Tracking |
|------|----------|
| `backend/**` (~338 files, 72 routers) | **UNTRACKED** |
| `services/` | UNTRACKED and **empty on disk** |
| `docker-compose.yml` | TRACKED |
| `.github/workflows/{backend-tests,deploy-backend,backend-nightly}.yml` | TRACKED |

**Evidence**

- Root `docker-compose.yml` line 1 (TRACKED): "# LEGACY LOCAL STACK — DynamoDB/Cognito/FastAPI path (NOT F5/F6 canonical pilot)."
- Strangler doc: "**FastAPI legacy** | `backend/` port `8000` | **Frozen** — not pilot authority"; retirement Phase 5 status: "retirement **not executed**" (Phase 0 coexistence).
- Deprecation plan §2.1: "FastAPI API | `backend/` (~70 routers, 96 services) | Primary LMS/cert API for many deployments."

**Contradiction:** `deploy-backend.yml` (TRACKED) still deploys `backend/` to AWS Lambda (`confora-lms-api`, `api.confora.io`) on push to main — but `backend/` is untracked, so a CI checkout contains no `backend/` directory. The workflow cannot succeed.

**Additional finding:** ADR-002 and the strangler doc treat `services/` as a frozen legacy component, but the directory is **empty** (0 entries). The "legacy services" do not exist as code.

---

## 5. Legacy frontend — `frontend-public/`

**Classification: PARTIALLY VERIFIED**

`frontend-public/` (UNTRACKED) is a Next.js marketing site with `kursevi/` catalog, `prijava`/`registracija`, `verify/[hash]`. Its `lib/get-api-url.ts` defaults to the **legacy** FastAPI: `... ?? "http://127.0.0.1:8000"`.

Deprecation plan: "Marketing Next.js | `frontend-public/` | Public marketing site | Consolidate into `apps/web`."

However, F5 evidence lists "Public verify | `frontend-public` + Nest verification API" as a proven gate, so it is not dead in practice. Its `package.json` declares `"@confora/i18n": "workspace:*"` while the directory is not a workspace member — an install inconsistency.

---

## 6. Public verification — **VERIFIED, three parallel implementations**

| Implementation | Path | Tracking |
|----------------|------|----------|
| Pilot path (signed off) | `frontend-app/src/pages/public/VerifyLookupPage.tsx`, `frontend-app/e2e/s17-public-verify-browser.spec.ts`, `scripts/ops/run-s17-public-verify-browser.mjs`, `scripts/ops/public-verify-hash.mjs` | **TRACKED** |
| Nest API side | `apps/api/src/verify/` (imported by tracked `app.module.ts`) | **ABSENT from disk and git** |
| Next.js variant | `apps/web/src/app/verify/[uid]/page.tsx` | UNTRACKED |
| Marketing variant | `frontend-public/app/verify/[hash]/page.tsx` (calls `:8000`) | UNTRACKED |
| Legacy FastAPI | `backend/routers/certificate_verification.py` | UNTRACKED |

Sign-off: `docs/evidence/f5-pilot-readiness/2026-07-15T14-27-15-s17-public-verify-browser/S17_PUBLIC_VERIFY_BROWSER_REPORT.md` — "**Verdict: S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED**".

The FastAPI route self-labels `route_id="legacy.root.verify.crypto.get"` with `enforce_legacy_verify_fallback_available` — an explicit legacy fallback. The proven pilot path is `frontend-app` → Nest `verify/*`, but **the Nest server-side implementation is not in the repository**.

---

## 7. Public catalog — **PARTIALLY VERIFIED, three implementations, none fully tracked**

| Implementation | Path | Tracking |
|----------------|------|----------|
| `frontend-app` routes `/katalog`, `/courses` | `frontend-app/src/App.tsx` (routes tracked; page components untracked) | PARTIAL |
| Nest `LmsCatalogPilotModule` | imported by `app.module.ts` | **ABSENT** |
| `apps/web` schemes catalog | `apps/web/src/app/public/schemes/page.tsx`, `src/lib/public-api.ts` (→ `:4000/public/api/schemes`) | UNTRACKED |
| `frontend-public` course catalog | `frontend-public/app/kursevi/**` (→ `:8000`) | UNTRACKED |
| Legacy FastAPI | `backend/routers/certification_schemes.py`, `courses_api.py` | UNTRACKED |

---

## Contradictions (carried to `contradictions_and_open_questions.md`)

1. All governance authority documents (Baseline, ADRs, deprecation plans, strangler criteria, gap note) are **untracked**.
2. `apps/api` is canonical but **non-buildable at HEAD** — `app.module.ts` imports ~30 non-existent modules.
3. CI references untracked code throughout (`packages/database`, `infra/docker/Dockerfile.*`, `backend/`, F4 validation scripts).
4. **ADR-001 vs Frontend Gap Note** — direct conflict on which frontend is canonical.
5. **ADR-002 vs `services/`** — treated as legacy component; directory is empty.
6. Baseline §4.1 names `apps/web`/`apps/admin` canonical; both are untracked skeletons while the CI-gated, acceptance-signed UI is `frontend-app`, which is not even a workspace member.
7. Dual verify/catalog stacks remain live (strangler Phase 0 coexistence; retirement not executed).
8. Three competing IaC trees: `terraform/`, `infrastructure/terraform/`, `infra/aws/staging/`.
