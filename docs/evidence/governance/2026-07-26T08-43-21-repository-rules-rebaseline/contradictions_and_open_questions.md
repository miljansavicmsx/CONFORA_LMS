# Contradictions and Open Questions

Findings are ordered by severity. Each carries a classification and the paths that establish it. **None were repaired.**

---

## C-01 — The governance authority chain is broken in git — **CONTRADICTED**

`AGENTS.md` (**TRACKED**) states that agents SHALL read and follow `docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md` and treat it as higher authority than any other document. That file is **UNTRACKED**. So are all seven ADRs, `docs/MULTI_TENANCY_STANDARD.md`, `docs/SHARED_KERNEL_STANDARD.md`, `docs/LEGACY_DEPRECATION_PLAN.md`, `docs/architecture/CANONICAL_COMPONENT_REGISTRY.md`, and the entire G3/G4/G5/G6 series (41 files).

`.cursor/rules/**` (9 files) is not merely untracked but **gitignored** at `.gitignore:72`.

Consequence: a clone from `origin` contains an instruction to obey a document it does not contain, and none of the nine binding rule files. Governance rules cannot be reviewed, diffed, or enforced.

**Open question OQ-1:** Should `.cursor/rules/**` and `docs/governance/**` be tracked? If yes, the `.gitignore:72` `.cursor/` rule must be narrowed (e.g. keep ignoring `.cursor/` state but un-ignore `.cursor/rules/`). If no, where does versioned governance live instead?

---

## C-02 — The canonical backend cannot build from the tracked tree — **CONTRADICTED**

`apps/api` is designated canonical by the Baseline §4.2, ADR-002 and the strangler criteria, and CI targets `@confora/api`. Yet tracked `apps/api/src/app.module.ts` imports approximately 30 modules (`./verify/verify.module`, `./ai/ai.module`, `./lms/...`, `./audit/audit.module`, `./reports/...`) that exist neither on disk nor in any commit. On disk `apps/api/src/` holds only `auth`, `cert-governance`, `cert-wallet`, `prisma`.

The repository's own tracked audit confirms it: `docs/evidence/repo-health/2026-07-25T21-50-56-.../CONFORA_REPO_HEALTH_43A_REPORT.md`.

Several tracked files import missing modules:

| Tracked file | Missing import |
|--------------|----------------|
| `apps/api/src/app.module.ts` | `./auth/auth.module`, `./verify/verify.module`, ~28 more |
| `apps/api/src/prisma/prisma-tenant-extension.ts` | `./tenant-prisma.util`, `../tenant/tenant-context.store` |
| `apps/api/src/cert-wallet/me-certificates.service.ts` | `../audit/audit-ledger.service`, `../audit/audit-actor.util` |
| `apps/api/src/auth/actor-db-access.ts` | `PrismaService`, `./types/confora-user` |

**Open question OQ-2:** Is the missing `apps/api` source recoverable (another branch, another machine, a backup), or must it be reconstructed? This determines whether rules should govern `apps/api/**` as live code or as a reconstruction target.

---

## C-03 — Every CI workflow is broken on a fresh clone — **VERIFIED**

All 8 workflows in `.github/workflows/**` are tracked; all 8 reference untracked paths. Most severe: `deploy-backend.yml` is configured to deploy to production (`api.confora.io`, Lambda `confora-lms-api`) on every push to `main`, bundling `backend/` — a directory with **0 tracked files**.

Also: `accessibility.yml` and `f4-frontend-cutover-gate.yml` run `npm ci` against `frontend-app/package-lock.json`, which is **gitignored**.

Full analysis in `testing_ci_inventory.md` §7.

**Open question OQ-3:** Should broken workflows be disabled pending source restoration, or should the missing sources be imported first? Leaving a production deploy workflow armed against a non-existent directory is the highest-risk item in this package.

---

## C-04 — Security and compliance controls live outside version control — **VERIFIED**

The complete runtime authorization layer — Cognito JWT verification, `require_permission`, role/permission maps, SoD hard blocks, tenant assertions — is in `backend/`, which has **0 tracked files**. Likewise the 115-file pytest suite that tests it, the 62 Prisma migrations, the audit append-only triggers, and the ISO 17024 compliance E2E suite.

Consequence: ISO/IEC 27001 change control, ISO/IEC 17024 SoD evidence and GDPR data-handling controls cannot be demonstrated through repository history or pull-request review.

**Open question OQ-4:** Is `backend/` intended for import under the RH programme, for archival, or for deletion after strangler completion? The answer changes whether rules should cover `backend/**` at all.

---

## C-05 — ADR-001 vs the Frontend Canonicalization Gap Note — **CONTRADICTED**

- `docs/architecture/decisions/ADR-001-frontend.md` (status **Accepted**): "Primary app: `apps/web/` … Legacy `frontend-app/` and `frontend-public/` are **frozen** pending migration."
- `docs/governance/FRONTEND_CANONICALIZATION_GAP_NOTE.md` (later): "`frontend-app` is **operational truth** … **not deprecated for pilot**"; migration "**not started**".

Evidence favours the gap note: the only frontend CI workflow builds `frontend-app`; all frontend acceptance evidence targets `frontend-app`; `apps/web` has 0 tracked files.

An Accepted ADR overridden by practice with no superseding ADR is itself a governance defect.

**Open question OQ-5:** Which frontend is canonical for the rebaseline? Rules scoped to `apps/web/**` would currently govern nothing.

---

## C-06 — Tenant isolation has four code-level bypasses — **VERIFIED**

`docs/MULTI_TENANCY_STANDARD.md` calls tenancy "non-negotiable". Actual state:

| Bypass | Location | Tracking |
|--------|----------|----------|
| Prisma `update`/`delete` skip tenant merge | `apps/api/src/prisma/prisma-tenant-extension.ts` L38–44 | **TRACKED** |
| Extension is fail-open when ALS context unset | same file, L135 | **TRACKED** |
| FastAPI allows when resource tenant is null | `backend/core/tenant_guard.py` L17–24 | UNTRACKED |
| `sys_admin` cross-tenant access | same function | UNTRACKED |

Plus **11 models** with a `tenantId` column absent from `TENANT_SCOPED_PRISMA_MODELS`, and 8 governance/ISO models with no tenant column at all (`Risk`, `InternalAudit`, `CorrectiveAction`, `AuditFinding`, `ConflictOfInterestDeclaration`, `IdentityVerification`, `Consent`, `VerificationAuditTrail`).

No tracked test covers the two tracked bypasses.

**Open question OQ-6:** Is the `update`/`delete` gap accepted risk with a compensating service-layer control, or an open defect? The code comment explains the Prisma limitation but names no compensating control.

---

## C-07 — Segregation of Duties exists only in the legacy stack, and is narrower than documented — **CONTRADICTED**

SoD hard blocks (`CERT_DECISION_SYS_ADMIN`, `CERT_DECISION_SELF_AS_CANDIDATE`) are implemented in `backend/core/sod.py` and `backend/services/sod_policy.py` — both **UNTRACKED**. The Nest equivalent (`no-conflict-of-interest.guard.ts`) is **NOT FOUND**.

Additionally, `backend/core/roles.py` L91–97 defines `ISO_FORBIDDEN_ROLE_COMBINATIONS` with the comment "*bez enforcementa u guardovima*" — **not enforced in guards**. The ISO-named list and the enforced list in `core/sod.py` are different sets. A reader of `roles.py` alone would overestimate SoD coverage.

**Do not record SoD as an implemented control for the canonical stack.**

---

## C-08 — Audit ledger is not rebuildable, and lacks RLS and write-path redaction — **PARTIALLY VERIFIED / CONTRADICTED**

- `apps/api/src/audit/**` — **NOT FOUND on disk and never in git history**, while tracked code imports it and untracked `dist/` still contains the compiled implementation.
- The migration named `20260218100001_audit_append_only_and_rls` applies append-only triggers to `audit."AuditEvent"` but enables RLS only on *other* tables. **No RLS on the audit table.** The name overstates delivery.
- No PII redaction on the canonical write path, while `oldValue`/`newValue` capture arbitrary entity state into an immutable, trigger-protected table. Post-hoc redaction is blocked by the very triggers that make it append-only — a GDPR erasure conflict.
- Hash formats differ between stacks: Nest `sha256(prev + canonicalJson)` vs legacy `sha256(prev + '|' + payloadHash)`. Legacy history cannot be verified under the canonical algorithm.
- `createAuditClient` — the package's primary runtime API — has **zero callers**.
- **Registry vs G5 conflict:** G5 mandates `@confora/audit-client`; `CANONICAL_COMPONENT_REGISTRY.md` marks it **Legacy** and points to `packages/audit`, which is a README-only stub.

**Open question OQ-7:** Which is canonical — `@confora/audit-client` or the future `packages/audit`? And how is GDPR erasure reconciled with append-only triggers?

---

## C-09 — Two persistence stacks, two role vocabularies, two IdPs, three IaC trees — **CONTRADICTED**

| Dimension | Option A | Option B | Mapping between them |
|-----------|----------|----------|----------------------|
| Persistence | Prisma/Postgres (109 models, 62 migrations) | DynamoDB (22 Terraform tables) | none |
| Roles | `USR_CAND`, `COM_CERT`, `STAFF_SYSADM` (TRACKED types) | `learner`, `cert_committee`, `sys_admin` (UNTRACKED) | **none exists** |
| Identity | Keycloak (documented canonical) | Cognito (operational) | none |
| Prisma schema | `packages/database/prisma/schema.prisma` (109 models) | `prisma/schema.prisma` (40 models, self-deprecated) | — |
| IaC | `terraform/` | `infrastructure/terraform/`, `infra/aws/staging/` | — |

The absence of a role-vocabulary mapping is the most concrete of these: a user authenticated in one stack has no defined authorization identity in the other.

---

## C-10 — Documented controls consistently outrun implemented controls — **VERIFIED (pattern)**

| Control | Documented as | Actually |
|---------|---------------|----------|
| Tenant isolation | non-negotiable, enforced | partial, 4 bypasses, fail-open |
| SoD | ISO 17024 enforced | legacy stack only, narrower than named |
| Audit append-only + RLS | both | append-only yes, RLS on audit table no |
| Audit redaction | implied by GDPR compliance | essentially absent on write path |
| RBAC (Nest) | canonical | types only, no guard consumes `ROUTE_PERMISSIONS` |
| Test coverage (rule 07) | RBAC/cert/AI/audit/tenant mandatory | mostly untracked; orphan tracked tests never run |
| CI gates | operational | all 8 broken on fresh clone |

This pattern, not any single item, is the core governance risk.

---

## Lower-severity findings

**C-11 — `services/` is referenced as a legacy component but is empty on disk (0 entries).** ADR-002 and the strangler doc both list it.

**C-12 — `frontend-app` is outside the pnpm workspace** yet is the CI-gated, acceptance-signed primary UI. Root `pnpm test`/`turbo` cannot reach it. `frontend-public` declares `workspace:*` dependencies while also being outside the workspace.

**C-13 — Orphan tracked tests.** `packages/ai-prompts` and `packages/notification-templates` have tracked `*.test.ts` files but no `test` script.

**C-14 — Tracked Jest configs target non-existent directories** (`jest.integration.config.cjs` → `test/integration/`, `jest.compliance.config.cjs` → `test/compliance|gov/`).

**C-15 — `.cursorignore` excludes `prisma/migrations`** from agent indexing, hiding the audit and tenancy controls from the tools meant to enforce them.

**C-16 — `core.autocrlf=true` with no `.gitattributes`** produces a persistent 74-file phantom-dirty status. Content verified identical (`same=74 differs=0`).

**C-17 — Ignore gaps:** `packages/ai-client/src/index.{js,d.ts,js.map}` and `infra/aws/staging/.terraform/` are unignored and stageable. `package-lock.json` is ignored while two workflows require it for `npm ci`.

**C-18 — No security automation in CI:** no Dependabot, CodeQL, SAST or secret scanning, despite ISO 27001 alignment claims and evidence documents describing scans.

**C-19 — RH48A evidence is on disk but untracked** — the newest repo-health wave is not yet committed.

---

## Conditions for the verdict

The verdict is **READY WITH CONDITIONS**. The evidence baseline is complete and sufficient for an independent reviewer to produce a repository-specific governance package, provided that package is written subject to the following:

1. **State the tracked/untracked distinction explicitly.** Rules must declare whether they bind the tracked tree, the working tree, or both. A rule that assumes untracked code is unenforceable by CI or review.
2. **Do not assert as implemented** anything classified in this package as PARTIALLY VERIFIED, ASSUMED or NOT FOUND — in particular tenant isolation, SoD, audit redaction and Nest RBAC.
3. **Resolve OQ-1 through OQ-7** (owner decisions, not audit findings) before the rules are finalised.
4. **Resolve C-05** (which frontend is canonical) before writing any frontend rule glob.
5. **Treat C-03** (armed production deploy workflow against a non-existent directory) as a standalone remediation item, independent of the governance rebaseline.
6. **Track the governance corpus** (C-01) or the rebaselined rules will inherit the same defect they are meant to fix.

## What would change the verdict to NOT READY

Nothing in this audit was blocked or unverifiable to the point of invalidating the baseline. The verdict would drop to NOT READY only if the missing `apps/api` source proves unrecoverable **and** `backend/` is neither importable nor archivable, since the repository would then have no reconstructable canonical implementation to govern.
