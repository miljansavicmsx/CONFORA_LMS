# CONFORA REPO HEALTH 47 — Accidental Staging Risk Review

## Overall risk: **HIGH**

The working directory contains very large untracked trees. Any broad add would commit thousands of unreviewed files, generated artifacts, vendored `node_modules`, and deferred content.

## Risk sources

| Source | Untracked files | Why dangerous |
|--------|:---------------:|---------------|
| `frontend-app/**` | 787 | huge unreviewed app tree |
| `backend/**` | 338 | possibly legacy/parallel backend; canonical status unresolved |
| `packages/database/**` | 75 | DB schema/migrations + vendored `node_modules` |
| `apps/**` | 74 | mixes tracked `apps/api` with untracked siblings |
| `frontend-public/**` | 72 | unreviewed |
| `tests/**` | 58 | unreviewed |
| `infrastructure/**` / `infra/**` | 39 / 33 | IaC; state/secret risk |
| `scripts/**` | many | ops scripts; `external-pilot-readiness.env.example`, keycloak/mfa scripts |
| `terraform/**` | — | IaC state/secret risk |
| ai-client generated artifacts | 3 | not gitignored; swept by `git add packages/ai-client/` or `git add packages/ai-client/src/` |
| HR MJML | 3 | deferred; must not import |

## Forbidden staging operations (this and future tasks)

```text
git add .
git add docs/
git add packages/
git add apps/
git add packages/ai-client/
git add packages/ai-client/src/
git clean (any form)
```

## Safe pattern

- Stage by **explicit file list** only.
- For evidence commits, stage only the specific RH evidence folder.
- Verify `git diff --cached --name-only` before every commit; it must contain only intended paths — no `.js`/`.d.ts`/`.map`, no `node_modules`, no `hr.mjml`, no large app/infra trees.

## Mitigations to consider (separate hygiene task)

1. Add `.gitignore` coverage for emitted `packages/*/src/**/*.{js,d.ts,map}` or relocate build output to `dist/` only.
2. Confirm `node_modules`, `dist`, `.turbo`, coverage are ignored across all package roots (spot-checked ignored for ai-client in RH45).

## Post-audit staging state

`STAGED_COUNT=0` before and after. RH47 staged nothing.
