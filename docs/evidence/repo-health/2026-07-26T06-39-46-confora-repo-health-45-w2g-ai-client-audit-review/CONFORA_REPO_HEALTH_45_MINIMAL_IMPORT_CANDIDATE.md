# CONFORA REPO HEALTH 45 — Minimal Import Candidate

## Proposed subset — exactly 5 files

```text
packages/ai-client/package.json
packages/ai-client/tsconfig.json
packages/ai-client/tsconfig.build.json
packages/ai-client/src/index.ts
packages/ai-client/src/metadata.test.ts
```

Total in-scope payload: 6,651 bytes of source/config (694 + 211 + 205 + 5,135 + 406).

## Why this subset is safe

| Criterion | Status |
|-----------|--------|
| Import-time side effects | none (zod schema construction only) |
| External provider / vendor coupling | none |
| `process.env` usage | none |
| Hardcoded endpoints or credentials | none |
| Secrets / PII / tenant identifiers | 0 / 0 / 0 |
| Weakens `packages/ai-prompts` fail-closed behaviour | no |
| Workflow-boundary blocking findings | 0 |
| Root manifest / lockfile / workspace edits required | none |
| Typecheck | PASS |
| Tests | 1/1 PASS |
| Generated / vendor artifacts included | none |

## Staging discipline (mandatory)

Because `src/index.js`, `src/index.d.ts`, and `src/index.js.map` are **not** gitignored, the subset must be staged by explicit path list. Never use a directory-scoped add.

Permitted (in a future import task, not this one):

```powershell
git add packages/ai-client/package.json `
        packages/ai-client/tsconfig.json `
        packages/ai-client/tsconfig.build.json `
        packages/ai-client/src/index.ts `
        packages/ai-client/src/metadata.test.ts
```

Forbidden: `git add .`, `git add packages/`, `git add packages/ai-client/`, `git add packages/ai-client/src`.

## Pre-commit verification for the import task

1. `git diff --cached --name-only` must list **exactly** the 5 paths above — no `.js`, no `.d.ts`, no `.map`, no `.tsbuildinfo`, no `dist/`.
2. `pnpm exec tsc --noEmit -p packages/ai-client/tsconfig.json` → PASS.
3. `pnpm exec tsx --test packages/ai-client/src/metadata.test.ts` → 1/1 PASS.
4. `pnpm-lock.yaml`, `pnpm-workspace.yaml`, root `package.json`, `apps/**`, `packages/ai-prompts/**` unchanged.
5. The 3 deferred HR MJML files remain untracked.
6. Record in the import evidence that `src/index.js`, `src/index.d.ts`, `src/index.js.map`, `tsconfig.build.tsbuildinfo` remain untracked-and-excluded by design.

## Explicitly out of the candidate set

```text
packages/ai-client/src/index.js
packages/ai-client/src/index.d.ts
packages/ai-client/src/index.js.map
packages/ai-client/tsconfig.build.tsbuildinfo
packages/ai-client/dist/**
packages/ai-client/node_modules/**
packages/ai-client/.turbo/**
```

## What this import does not authorise

It does not activate any AI runtime path, does not unblock the RH43 `apps/api` gateway rework, does not resolve the purpose/prompt-ID divergence, and carries no production, external-pilot, DPO/legal, security-delegate, accreditation, or AI-governance approval.
