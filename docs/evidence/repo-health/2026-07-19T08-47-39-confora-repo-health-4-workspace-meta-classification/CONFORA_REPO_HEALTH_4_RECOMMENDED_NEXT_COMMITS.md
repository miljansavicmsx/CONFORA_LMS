# Recommended next commits (proposal only — not executed)

## Commit A — workspace meta (pnpm identity + quality gates)

**Explicit paths only** (no `git add .`), after human approval:

- `.editorconfig`, `.env.example`, `.prettierignore`, `.lighthouserc.json`
- `README.md`, `AGENTS.md`
- `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json`
- `eslint.config.mjs`, `prettier.config.cjs`, `commitlint.config.cjs`
- `.github/`, `.husky/`

Suggested message: `chore(repo): track pnpm workspace meta and quality gates`

**Exclude:** `package-lock.json`, root `docker-compose*`, `test-all.*`, root CONFORA docx/pdf/planning md (unless separately approved).

## Commit B — optional follow-ups (separate reviews)

1. Legacy compose + test-all (with LEGACY banner retained).
2. `.cursorignore` if team wants shared Cursor ignore.
3. Curated root governance docs (owner decision).
4. Delete empty `package-lock.json` in an approved cleanup task (not now).

## Non-goals of Commit A

- No application source (`apps/`, `frontend-app/src`)
- No ops scripts wave
- No evidence bulk add
