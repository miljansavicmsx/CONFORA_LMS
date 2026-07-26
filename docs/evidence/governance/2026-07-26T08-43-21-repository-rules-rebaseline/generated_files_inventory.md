# Generated Files Inventory

**Summary: ignore coverage is good for conventional build output. Two real gaps exist — compiled emit inside `packages/ai-client/src/`, and `.terraform/` provider binaries. No generated file is currently tracked.**

---

## Root `.gitignore` coverage

**Covered:** `node_modules/`, `dist/` (plus `apps/**/dist/`, `packages/**/dist/`, `frontend-app/dist/`), `.next/`, `.turbo/`, `coverage/`, `*.log`, `*.tsbuildinfo`, `.venv/`, `**/__pycache__/`, `.pytest_cache/`, `.env*`, `.cursor/`, `.vscode/`, Playwright reports, `apps/api/src/schema.gql`, `package-lock.json`.

**Gaps:**

1. **No `.terraform/` rule** — provider binaries appear as untracked and stageable.
2. **No rule for compiled emit into `src/`** — e.g. `packages/ai-client/src/index.{js,d.ts,js.map}`.
3. **`package-lock.json` is ignored** while two CI workflows run `npm ci` against `frontend-app/package-lock.json`. Ignoring a lockfile that CI requires is a defect in its own right (see `testing_ci_inventory.md` §7).
4. **`.cursor/` ignored** — governance rules never enter git history.

## Artifact inventory

| Category | Example paths | Approx. files | Ignored? | Tracked? | Finding |
|----------|---------------|--------------:|:--------:|:--------:|---------|
| `dist/` | `apps/api/dist` (~1681), `frontend-app/dist` (~80), `apps/examiner/dist`, and 10 `packages/*/dist` | ~1800+ | Yes | **0** | OK |
| `node_modules/` | root, `apps/{api,web,admin,worker,examiner}`, `packages/{ai-client,database}`, `frontend-app`, `frontend-public` | very large | Yes | **0** | OK |
| `.turbo/` | root (~492), `apps/api/.turbo`, `apps/web/.turbo` | ~500 | Yes | **0** | OK |
| `coverage/` | `apps/api/coverage` (~167), `apps/worker/coverage` (~12) | ~179 | Yes | **0** | OK |
| `*.tsbuildinfo` | `packages/ai-client/tsconfig.build.tsbuildinfo`, `apps/web/tsconfig.tsbuildinfo`, many more | dozens | Yes | **0** | OK |
| **Compiled JS/DTS/maps inside `src/`** | `packages/ai-client/src/index.js`, `index.d.ts`, `index.js.map` | **3** | **NO** | 0 (untracked) | **GAP — accidental-commit risk** |
| Prisma generated client | `**/node_modules/@prisma/client` (~115 files per install) | ~230 | Yes (via `node_modules/`) | **0** | OK |
| **`.terraform/`** | `infra/aws/staging/.terraform/` incl. `terraform-provider-aws_v5.100.0_x5.exe` | provider tree | **NO** | **0** | **GAP — untracked binary, shows `??`** |
| Python `__pycache__` | `backend/__pycache__` and many under `backend/.venv` | many | Yes | **0** | OK |
| `.venv` | `backend/.venv` | very large | Yes | **0** | OK |
| `.pytest_cache` | root (~5), `backend/.pytest_cache` | small | Yes | **0** | OK |
| Root log files | `api-dev.log`, `api-dev-2.log`, `frontend-dev.log`, `tmp-api-f49.log` | 4 (~0.7 MB) | Yes (`*.log`) | **0** | OK |
| `.next/` | `apps/web/.next`, `apps/admin/.next`, `frontend-public/.next` | large | Yes | **0** | OK |
| GraphQL schema emit | `apps/api/src/schema.gql` | 1 | Yes (explicit rule) | **0** | OK — precedent for a targeted `src/` emit rule |
| Untracked root scratch files | `repo-status-snapshot.txt`, `repo-tracked-files.txt`, `tmp-keycloak-setup-output.txt`, `Screenshot ... .png`, `test-all.ps1/.sh` | ~7 | No | **0** | Minor clutter |

## Tracked-generated check

`git ls-files` counts are **0** for every one of: `**/dist/**`, `**/node_modules/**`, `**/.turbo/**`, `**/coverage/**`, `*.tsbuildinfo`, `**/.prisma/**`, `*.log`, `packages/**/src/*.js`, `**/.terraform/**`, `**/.next/**`.

**No generated artifact is tracked.** This is a genuine strength and reflects the discipline of the RH import programme.

---

## Gap 1 — compiled emit in `packages/ai-client/src/`

```text
git check-ignore -v packages/ai-client/src/index.js    → exit 1 (no matching rule)
git check-ignore -v packages/ai-client/src/index.d.ts  → exit 1
git check-ignore -v packages/ai-client/src/index.js.map → exit 1
```

These three files sit beside the two canonical sources (`index.ts`, `metadata.test.ts`) in a directory a developer would plausibly `git add`. They are outputs of a build that wrote into the source tree rather than `dist/`.

This was analysed in detail by RH48A (`docs/evidence/repo-health/2026-07-26T08-14-44-.../`), which recommended a **package-local** ignore file rather than a broad root pattern:

```gitignore
# packages/ai-client/.gitignore
/src/*.js
/src/*.d.ts
/src/*.js.map
```

Package-local scoping is safer because a root-level `packages/**/src/*.js` rule would silently hide legitimate `.js` sources in other packages (for example `packages/config` ships `.cjs`/`.mjs` and `packages/config/eslint-rules/*.test.mjs` is tracked).

**Risk before:** HIGH (unignored, stageable, adjacent to source). **Risk after the proposed rule:** LOW.

**Not applied in this task** — RH48B is the designated follow-up.

## Gap 2 — `.terraform/`

`infra/aws/staging/.terraform/` contains an AWS provider executable (~hundreds of MB class binary) and is not matched by any ignore rule. It currently shows as `??` in `git status`. A `git add infra/` would attempt to commit a provider binary.

Recommended (not applied): add `.terraform/` and `*.tfstate*` to the root `.gitignore`.

## Gap 3 — no generated-file manifest

There is no `docs/GENERATED_FILES.md` or equivalent registry declaring which paths are generated and by which command. Ignore rules are the only record, and they are incomplete. A manifest would make Gaps 1 and 2 detectable by review rather than by accident.

---

## Recommended additions (for the rebaseline, NOT applied here)

| Target file | Rule | Rationale |
|-------------|------|-----------|
| `packages/ai-client/.gitignore` (new) | `/src/*.js`, `/src/*.d.ts`, `/src/*.js.map` | scoped; cannot hide other packages' sources |
| root `.gitignore` | `.terraform/`, `*.tfstate`, `*.tfstate.*` | prevents committing provider binaries and state |
| root `.gitignore` | reconsider `package-lock.json` | two CI workflows require `frontend-app/package-lock.json` for `npm ci` |
| new `.gitattributes` | `* text=auto eol=lf` (or explicit per-type) | eliminates the 74-file phantom-dirty status caused by `core.autocrlf=true` with no attributes file |
| new `docs/GENERATED_FILES.md` | manifest of generated paths and their producing commands | makes generated-file drift reviewable |

None of these were applied. This task is audit-only.
