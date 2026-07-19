# CONFORA-REPO-HEALTH-1 — Top-Level Inventory

## Operator-reported workspace

| Metric | Reported |
|--------|----------|
| Files | 276,800 |
| Folders | 55,099 |
| Size | 6.22 GB |
| Git loose objects | 518.60 MiB |

## Top-level categories (working tree)

| Category | Examples present locally | Hygiene class |
|----------|--------------------------|---------------|
| Application / monorepo source | `apps/`, `frontend-app/`, `packages/`, `scripts/`, `prisma/`, `infrastructure/`, `terraform/` | Source — selectively tracked |
| Documentation | `docs/` (policies + `docs/evidence/`) | Docs/evidence — retain; selective track |
| Dependencies | `node_modules/`, `frontend-app/node_modules/`, `apps/*/node_modules/`, `backend/.venv/` | Generated — never commit |
| Build / cache | `frontend-app/dist/`, `apps/api/dist/`, `.turbo/` | Generated — never commit |
| Local tools | `.tools/` (DynamoDB Local etc.) | Local tooling — ignore |
| Local backups | `.local-backups/` | Local-only — ignore; do not commit dumps |
| IDE / agent | `.cursor/`, `.vscode/`, `.cursorignore` | Editor — usually ignore or selective |
| CI / repo meta | `.github/`, `.editorconfig`, `.husky/`, lockfiles | Should usually be tracked when intentional |
| Secrets templates | `.env.example`, `*.env.example` | Safe templates OK; real `.env*` never |
| Local risk | `tmp-keycloak-setup-output.txt`, `Screenshot *qr.png`, `repo-*-snapshot.txt` | Local-only — never commit |

## Branch / remote

| Item | Value |
|------|-------|
| Branch | `fix/ca-h01-frontend-f4-cutover` |
| Upstream | `origin/fix/ca-h01-frontend-f4-cutover` |
| Recent push | Reported successful by operator |

## Classification legend used in this audit

| Class | Meaning |
|-------|---------|
| TRACKED | In git index |
| MODIFIED | Tracked + dirty |
| UNTRACKED_SOURCE | Present locally, not tracked; may be intentional future content |
| GENERATED | Build/deps/cache — ignore |
| EVIDENCE | Under `docs/evidence/` — retain; policy-governed commit |
| LOCAL_ONLY | Must never be committed |
| META_GAP | Should be tracked (e.g. `.gitignore`) but currently untracked |
