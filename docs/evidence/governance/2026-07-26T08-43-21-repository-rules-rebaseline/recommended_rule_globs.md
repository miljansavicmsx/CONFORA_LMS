# Recommended Rule Globs

Proposed scoping for the repository-specific governance package. **Nothing here has been applied.** These are recommendations for the independent reviewer.

## Design principles

1. **Glob only what exists.** A rule attached to `apps/web/**` currently governs zero tracked files. Prefer globs that match tracked reality, with a documented migration path.
2. **Separate binding rules from aspirational ones.** Where the target architecture differs from the current tree, say so in the rule body rather than encoding the target in the glob.
3. **Never claim enforcement the repository cannot perform.** If CI cannot check it, the rule is guidance, not a gate.
4. **Keep security-critical globs narrow** so that reviewers can see exactly which files a control covers.

---

## A. Rules that should apply to everything

| Rule | Glob | Notes |
|------|------|-------|
| Project governance | `**` (always-apply) | Currently `.cursor/rules/00-project-governance.mdc` |
| Baseline reference | `**` (always-apply) | Currently `confora-baseline.mdc` — **must cite a tracked Baseline**; see C-01 |
| Architecture principles | `**` (always-apply) | Currently `01-architecture.mdc` |

---

## B. Backend

| Scope | Recommended glob | Status today |
|-------|------------------|--------------|
| Canonical Nest API | `apps/api/**/*.ts` | 20 tracked files; source largely missing (C-02) |
| Nest workers | `apps/worker/**/*.ts` | untracked |
| **Legacy FastAPI** | `backend/**/*.py` | untracked; needs a *distinct* rule, not the Nest one |

Recommended split — one rule per stack, because the current `02-backend.mdc` mandates NestJS/Prisma patterns that are meaningless for `backend/**`:

```text
apps/api/**/*.ts, apps/worker/**/*.ts   → canonical backend rule (Nest, Prisma, DTO validation, RBAC, audit)
backend/**/*.py                          → legacy-freeze rule (no new features; bugfix + security only)
```

The legacy rule should encode the strangler policy verbatim: `docs/governance/LEGACY_STRANGLER_RETIREMENT_CRITERIA.md` — frozen, not pilot authority, retirement not executed.

---

## C. Frontend — **blocked on OQ-5 / C-05**

Two mutually exclusive options. The reviewer must choose:

**Option 1 — govern de-facto reality (recommended today):**

```text
frontend-app/src/**/*.{ts,tsx}   → primary UI rule
apps/web/**/*.{ts,tsx}           → migration-target rule (aspirational)
apps/admin/**/*.{ts,tsx}         → migration-target rule (aspirational)
frontend-public/**/*.{ts,tsx}    → legacy-freeze rule
```

**Option 2 — govern the ADR-001 target:**

```text
apps/web/**, apps/admin/**       → primary UI rule
frontend-app/**, frontend-public/** → legacy-freeze rule
```

Option 2 makes the primary rule govern 0 tracked files and marks the CI-gated, acceptance-signed UI as frozen. Option 1 matches CI, evidence and the gap note. Whichever is chosen, a superseding ADR should record the decision, because ADR-001 is currently Accepted-but-overridden.

Accessibility (WCAG 2.2) and i18n rules should attach to **both** trees regardless:

```text
{frontend-app,apps/web,apps/admin,frontend-public}/**/*.{ts,tsx}
```

---

## D. Database and persistence

| Scope | Recommended glob |
|-------|------------------|
| Prisma schema | `packages/database/prisma/schema.prisma` |
| Migrations | `packages/database/prisma/migrations/**/*.sql` |
| Seeds | `packages/database/prisma/seed*.ts`, `packages/database/prisma/seeds/**` |
| Prisma access layer | `apps/api/src/prisma/**/*.ts`, `apps/worker/src/prisma/**/*.ts` |
| Deprecated monolith schema | `prisma/schema.prisma` — mark **do-not-edit** |

The tenant-column mandate from `04-database.mdc` should be expressed as a reviewable checklist tied to the concrete lists in `database_persistence_inventory.md` §9–10, not as a general statement, since 35 models legitimately lack `tenantId` and 8 of those are governance records that should not.

Also worth a dedicated rule: `apps/api/src/prisma/prisma-tenant-extension.ts` and any future `tenant-prisma.util.ts` are the tenant enforcement chokepoint. Changes there warrant explicit review.

---

## E. Identity, RBAC and SoD

| Scope | Recommended glob |
|-------|------------------|
| Role/permission contracts | `packages/shared-types/src/{roles,auth}.ts` |
| Tenant context contracts | `packages/shared-kernel/src/tenant.ts` |
| Nest auth | `apps/api/src/auth/**/*.ts` |
| Legacy authorization | `backend/core/{roles,permissions,role_permissions,sod,tenant_guard,resource_access,rbac_audit}.py`, `backend/services/{authorization_service,abac_service,sod_policy}.py` |
| IdP provisioning | `infra/keycloak/**`, `scripts/ops/keycloak-*.mjs` |

Because these files are the security perimeter, the rule should require that any change to them be accompanied by a test and an entry in the evidence corpus — a requirement the repository already demonstrates it can meet.

---

## F. Audit and evidence

| Scope | Recommended glob |
|-------|------------------|
| Audit client | `packages/audit-client/src/**/*.ts` |
| Future audit package | `packages/audit/**` |
| Nest audit module | `apps/api/src/audit/**/*.ts` (currently absent — C-08) |
| Audit migrations | `packages/database/prisma/migrations/**audit**/**` |
| Evidence corpus | `docs/evidence/**` — **append-only; never edit historical evidence** |

The evidence rule matters: 1087 tracked files under `docs/evidence/` constitute the compliance record. A rule prohibiting retroactive modification of existing evidence folders (new folders only) would protect it, and is consistent with how the RH programme already operates.

---

## G. AI governance

| Scope | Recommended glob |
|-------|------------------|
| Prompts | `packages/ai-prompts/**` |
| AI client | `packages/ai-client/**` |
| AI governance package | `packages/ai-governance/**` (stub today) |
| Nest AI gateway | `apps/api/src/ai/**` (currently absent) |
| Legacy AI routes | `backend/routers/{ai_tutor,ai_governance,roleplay}.py`, `backend/services/ai_*.py` |

These packages are among the few where tracked code matches documented policy (fail-closed prompt allowlist, inert client, `disclosure_shown` required, `human_oversight_required` default true). The rule should preserve those specific properties by name so that regressions are detectable.

---

## H. Testing and CI

| Scope | Recommended glob |
|-------|------------------|
| Nest tests | `apps/api/**/*.spec.ts`, `apps/api/test/**/*.e2e-spec.ts` |
| Package tests | `packages/*/src/**/*.{test,spec}.ts` |
| Frontend tests | `frontend-app/src/**/*.test.{ts,tsx}`, `frontend-app/e2e/**/*.spec.ts` |
| Compliance E2E | `tests/e2e/**/*.spec.ts` |
| Python tests | `backend/tests/**/*.py` |
| CI | `.github/workflows/*.yml` |
| Quality config | `turbo.json`, `eslint.config.mjs`, `prettier.config.cjs`, `commitlint.config.cjs`, `.husky/**` |

A CI-specific rule should require that a workflow only reference tracked paths — the check that would have caught C-03.

---

## I. Governance corpus itself

| Scope | Recommended glob |
|-------|------------------|
| Cursor rules | `.cursor/rules/**/*.mdc` — **requires un-ignoring; see C-01** |
| Agent instructions | `AGENTS.md` |
| Baseline and governance | `docs/governance/**/*.md` |
| Architecture and ADRs | `docs/architecture/**/*.md`, `docs/architecture/decisions/*.md` |
| Standards | `docs/{MULTI_TENANCY_STANDARD,SHARED_KERNEL_STANDARD,LEGACY_DEPRECATION_PLAN,AI_GOVERNANCE_MODEL}.md` |

**This is the highest-value change in the whole list.** Until these paths are tracked, every other rule rests on documents that are not in the repository.

---

## Globs to avoid

| Glob | Why |
|------|-----|
| `packages/**/src/*.js` (as an ignore rule) | would hide legitimate `.js`/`.mjs` sources, e.g. tracked `packages/config/eslint-rules/*.test.mjs`. Use a package-local ignore instead (see `generated_files_inventory.md`) |
| `docs/**` (as a single governance rule) | conflates the append-only evidence corpus with editable standards; they need opposite rules |
| `apps/**` (as one backend rule) | spans NestJS API, NestJS worker, two Next.js apps and an Electron app |
| `**/*.py` | would apply Python rules to `backend/.venv` and generated caches |
| Anything under `infrastructure/`, `terraform/`, `infra/` as a single IaC glob | three competing trees with different lifecycles (C-09) |

---

## Suggested rule-file set

Mapping the current nine rules onto the findings, a rebaselined set might be:

| File | Scope | Change from today |
|------|-------|-------------------|
| `00-project-governance.mdc` | always | cite a **tracked** Baseline |
| `01-architecture.mdc` | always | add the canonical/legacy matrix from `canonical_legacy_inventory.md` |
| `02-backend-canonical.mdc` | `apps/api/**`, `apps/worker/**` | split from `02-backend.mdc` |
| `02b-backend-legacy.mdc` | `backend/**/*.py` | **new** — freeze policy |
| `03-frontend.mdc` | pending OQ-5 | resolve canonical frontend first |
| `04-database.mdc` | `packages/database/**`, `apps/*/src/prisma/**` | add the concrete tenant-model lists |
| `05-ai-governance.mdc` | AI packages | name the specific fail-closed properties to preserve |
| `06-security.mdc` | auth/RBAC/SoD paths | state honestly which controls are implemented vs targeted |
| `07-testing.mdc` | test globs | align mandate with what CI can actually run |
| `08-evidence.mdc` | `docs/evidence/**` | **new** — append-only evidence rule |
| `09-generated-files.mdc` | ignore policy + manifest | **new** — closes C-17 |
