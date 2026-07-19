# CONFORA-REPO-HEALTH-1 — .gitignore Gaps

## Critical meta gap

| Item | Finding |
|------|---------|
| Root `.gitignore` | **Exists on disk but is NOT tracked** (`pathspec '.gitignore' did not match any file(s) known to git`) |
| Effect | Local ignore works for this machine; fresh clones / other worktrees may lack the same rules unless the file is committed |

**Recommendation:** Track a hardened `.gitignore` in a dedicated follow-up commit (after review). Proposed content: `PROPOSED_gitignore_hardening.patch.txt` in this evidence folder (**not applied**).

## Current ignore coverage (local file)

Already covers (high level): `node_modules/`, `dist/`, `build/`, `.next/`, Vite/dist paths, Python caches, `coverage/`, Playwright reports/results, `*.log`, `logs/`, `tmp/`, `temp/`, `.turbo/`, `.env`, `.env.local`, `scripts/ops/.dev/`.

## Gaps observed via `git check-ignore`

| Path | Ignored? | Risk |
|------|:--------:|------|
| `node_modules/` | Yes | OK |
| `frontend-app/.env.local` | Yes | OK |
| `.env` | Yes | OK |
| `frontend-app/test-results/` | Yes | OK |
| `.local-backups/` | **No** | SQL/local dumps could be added accidentally |
| `.tools/` | **No** | Large local binaries (~602 MB) |
| `tmp-keycloak-setup-output.txt` | **No** | Auth setup output — local-only |
| `docs/evidence/` | **No** | Correct to remain visible; commit selectively — not a blanket ignore |
| `repo-status-snapshot.txt` | **No** | Local inventory dump |
| `repo-tracked-files.txt` | **No** | Local inventory dump |
| `.cursor/` | **No** | Agent/editor local state |
| `.vscode/` | **No** | Editor local settings (team may choose selective track) |
| `Screenshot 2026-07-14 213452qr.png` | **No** | **QR/screenshot — never commit** |
| `apps/api/dist/` | Unclear / treat as generate | Propose explicit `apps/**/dist/` |
| `backend/.venv/` | Not explicitly | Propose `.venv/` / `**/.venv/` |

## Proposed hardening themes (see patch file)

1. Track root `.gitignore`.
2. Ignore `.local-backups/`, `.tools/`, `**/.venv/`, `apps/**/dist/`, `.cache/`.
3. Ignore local dumps: `tmp-keycloak-setup-output.txt`, `repo-*-snapshot.txt`, `repo-tracked-files.txt`.
4. Ignore screenshot/QR patterns at repo root: `Screenshot*.png`, `*qr*.png` (careful not to blanket-ignore legitimate assets under `docs/`/`frontend-app/public` — prefer root-only patterns).
5. Ignore `.cursor/` (keep `.cursor/rules` policy decision separate if team wants rules tracked).
6. Keep `.env.example` allowed; keep real env files ignored.

## Non-gap

`docs/evidence/` should **not** be globally gitignored — evidence is intentional governance output. Use retention + selective add instead.
