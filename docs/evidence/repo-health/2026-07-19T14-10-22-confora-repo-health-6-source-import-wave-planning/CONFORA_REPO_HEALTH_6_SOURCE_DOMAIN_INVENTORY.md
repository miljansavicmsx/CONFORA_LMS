# CONFORA-REPO-HEALTH-6 — Source domain inventory

Counts = untracked files via `git ls-files --others --exclude-standard` unless noted. Examples only — not full dumps.

## Domain groups

| Domain | Untracked (approx) | Representative examples |
|--------|-------------------:|-------------------------|
| Root remaining docs/config | ~20 porcelain paths | `docker-compose.yml`; `.cursorignore`; `prisma/`; root `CONFORA_*.md`/`.docx`/`.pdf`; `test-all.ps1` |
| `apps/api` config | ~10+ | `package.json`; `nest-cli.json`; `tsconfig*.json`; `jest*.cjs` |
| `apps/api` src core/shared | ~8–20 | `common/`; `config/`; `app.module`/`main` wiring fragments (most core already sparse) |
| `apps/api` auth/security/tenant/prisma | ~49 auth+security+tenant+prisma | `src/auth/*`; `src/security/*`; `src/tenant/*`; `src/prisma/*` |
| `apps/api` certification domains | ~450 | `cert-*`; `appeals-complaints*`; `verify/`; `exam*`; `identity-review/` |
| `apps/api` education/LMS domains | ~60 | `lms/`; `course-*`; `dashboard/` |
| `apps/api` other src | remainder of 745 src | `admin*`; `ai/`; `contact*`; `governance/`; `notifications/`; `reports/`; `sysadmin/` |
| `apps/api` tests/e2e | ~78 | `apps/api/test/*.e2e-spec.ts` |
| `frontend-app` config | ~10 | `package.json`; `vite.config.ts`; `tsconfig*`; `tailwind.config.js`; `.env.example` |
| `frontend-app` src shell/routing/auth/layout | large share of 731 | `src/lib/`; `layouts/`; `hooks/`; auth-related lib; shell components |
| `frontend-app` src certification | pages/admin cert areas | staff cert pages; appeals/complaints; verify; decision/issuance UIs |
| `frontend-app` src education/LMS | courses/learn/catalog | `pages/courses`; `CoursePlayer`; learner catalog |
| `frontend-app` e2e | ~55 | `frontend-app/e2e/*.spec.ts` |
| `scripts/ops` | ~195 | smoke runners; audits; MFA helpers |
| `packages/*` | ~158 | `database` (75); `config`; `ui`; `shared-*`; `ai-*` |
| `docs/*` (non-evidence) | ~628 | `architecture` (41); `implementation` (179); `governance` (12); planning/legal |
| `docs/evidence/*` | **~102258** | 71 folders; smoke trees hold thousands of binaries each |
| infra/terraform/infrastructure | 33 + 39 + 4 | IaC / deploy scaffolding |

## Frontend `src` shape (untracked)

| Top folder | Count |
|------------|------:|
| `lib` | 292 |
| `components` | 195 |
| `pages` | 139 |
| `design-system` | 41 |
| `admin` | 24 |
| other | smaller |

## API `src` largest modules (untracked)

| Module | Count |
|--------|------:|
| `cert-complaints` | 50 |
| `cert-appeals` | 45 |
| `cert-recertification` | 35 |
| exam session/attempt modules | ~30 each |
| `lms` | 30 |
| `auth` | 28 |
| certification-decision / issuance | 20 / 16 |

## Non-primary trees (porcelain presence)

| Path | Notes |
|------|-------|
| `backend/` | Large legacy-looking tree (~338 untracked files listed; disk much larger) — not primary Nest/Vite path |
| `frontend-public/` | Separate public surface (~72) |
| `tests/` | Root tests (~58) |
