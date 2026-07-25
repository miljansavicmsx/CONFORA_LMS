# CONFORA REPO HEALTH 44 — Accidental Staging Risk Review

## Immediate risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| `git add .` / `git add packages/` / `git add apps/` | **High** | Would sweep untracked packages, apps, HR MJML, possibly ignore-bypass mistakes |
| Staging `packages/database` wholesale | **High** | Migrations/seed without architecture evidence |
| Staging `packages/ai-client` without audit | **Medium** | Purpose/gateway coupling needs RH45-class audit first |
| Staging HR MJML | **Medium** | Explicitly deferred |
| Staging `apps/api/dist` or `coverage` | **High** if ignore bypassed | Currently gitignored — do not force-add |
| Staging untracked `apps/*`, `frontend-*`, `terraform`, `backend` | **High** | Out of controlled import policy |

## Safe practice

- Never `git add .`
- Path-scoped adds only after evidence GO
- Keep RH43 blocked; do not invent apps/api AI patches from dist

## This audit

No source staged. Evidence written only under RH44 folder.
