# Untracked source candidates (future tracking)

Heuristic matches only. **Owner review required** before any `git add`.

| Group | Count | Examples |
|-------|------:|----------|
| `root_config` | 14 | `.editorconfig`; `.env.example`; `.lighthouserc.json`; `.prettierignore`; `AGENTS.md`; `README.md` |
| `.github` | 1 | `.github/` |
| `.husky` | 1 | `.husky/` |
| `apps/api/src` | 54 | `apps/api/src/app.controller.spec.ts`; `apps/api/src/app.controller.ts`; `apps/api/src/app.module.safe-wiring.spec.ts`; `apps/api/src/auth/auth-api.controller.ts`; `apps/api/src/auth/auth-production-config.spec.ts`; `apps/api/src/auth/auth-production-config.ts` |
| `apps/api/test` | 64 | `apps/api/test/auth-access-observability.e2e-spec.ts`; `apps/api/test/auth-contract.e2e-spec.ts`; `apps/api/test/auth.e2e-spec.ts`; `apps/api/test/b0-2-safe-wiring.e2e-spec.ts`; `apps/api/test/b1-public-verify-unification.e2e-spec.ts`; `apps/api/test/b10-1-staff-certification-decision-foundation.e2e-spec.ts` |
| `frontend-app/e2e` | 55 | `frontend-app/e2e/admin-reports-1-audit-viewer.spec.ts`; `frontend-app/e2e/admin-reports-1-certification-reports-exports.spec.ts`; `frontend-app/e2e/admin-reports-1-dashboard.spec.ts`; `frontend-app/e2e/admin-reports-2-dashboard.spec.ts`; `frontend-app/e2e/appeals-complaints-1.spec.ts`; `frontend-app/e2e/b3-3d-draft-write-hybrid.spec.ts` |
| `frontend-app/src` | 329 | `frontend-app/src/components/CourseCard.tsx`; `frontend-app/src/components/CourseTOC.tsx`; `frontend-app/src/components/EmbedHostedVideo.tsx`; `frontend-app/src/components/HtmlRenderer.tsx`; `frontend-app/src/components/LessonContent.tsx`; `frontend-app/src/components/OffCanvasPanel.tsx` |
| `packages` | 7 | `packages/shared-types/package.json`; `packages/shared-types/src/auth.ts`; `packages/shared-types/src/health.test.ts`; `packages/shared-types/src/index.ts`; `packages/shared-types/src/roles.ts`; `packages/shared-types/tsconfig.build.json` |
| `prisma` | 1 | `prisma/` |
| `scripts/ops` | 193 | `scripts/ops/_tmp-repo-health-3-classify.mjs`; `scripts/ops/audit-f4-frontend-api-usage.mjs`; `scripts/ops/audit-legacy-routes.mjs`; `scripts/ops/b10-4-certification-decision-smoke.helpers.mjs`; `scripts/ops/b10-4-certification-decision-smoke.helpers.test.mjs`; `scripts/ops/b11-4-certificate-issuance-smoke.helpers.mjs` |

## Priority tiers (proposed)

### Tier A — monorepo identity (small, high leverage)

Root workspace/config likely needed for reproducible clones: `pnpm-workspace.yaml`, `pnpm-lock.yaml` / `package-lock.json` (pick one package manager), `turbo.json`, `eslint.config.mjs`, `prettier.config.cjs`, `commitlint.config.cjs`, `docker-compose.yml`, `README.md`, `AGENTS.md`, `.env.example`, `.github/`, `.husky/`, `prisma/`.

### Tier B — product runtime source

- `frontend-app/src` (329)
- `apps/api/src` (54)
- `packages/*` (7)

Track in **domain-scoped commits**, never `git add .`.

### Tier C — tests / e2e / ops runners

- `apps/api/test` (64)
- `frontend-app/e2e` (55)
- `scripts/ops` (193) — many referenced by root `package.json` scripts (43 untracked ops paths referenced)

### Not automatic candidates

- Root `*.docx` / large PDF planning packs — owner decision (see docs classification).
- `apps/api/build-log.txt` — local build artifact; do not track.
- `scripts/ops/_tmp-repo-health-3-classify.mjs` — temporary audit helper; do not track.
