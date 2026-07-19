# CONFORA-REPO-HEALTH-1 — Safe Cleanup Plan (PROPOSED — NOT EXECUTED)

**Status:** Proposal only. `cleanup_executed: false`. **Do not run** these steps without explicit operator approval.

## Safety rules (always)

1. Do **not** delete `docs/evidence/**`.
2. Do **not** delete `.env`, `.env.local`, or secret stores (ignore/protect; do not commit).
3. Do **not** use `git add .` or `git clean -fdx` without a dry-run review.
4. Prefer regenerable artifacts first (`node_modules`, `dist`, `.turbo`).
5. Capture disk savings estimate before/after if cleanup is approved later.

## Phase A — Ignore hardening (git metadata only)

| Step | Action | Risk |
|------|--------|------|
| A1 | Review `PROPOSED_gitignore_hardening.patch.txt` | Low |
| A2 | Commit tracked hardened `.gitignore` in a dedicated docs/chore commit | Low |
| A3 | Confirm `git check-ignore` for `.tools`, `.local-backups`, keycloak temp, screenshots | Low |

## Phase B — Local regenerable deletes (optional)

| Step | Target | Expected reclaim | Risk |
|------|--------|------------------|------|
| B1 | `node_modules/` (root) | ~2.0 GB | Low (reinstall via pnpm) |
| B2 | `frontend-app/node_modules/` | ~0.35 GB | Low |
| B3 | `frontend-app/dist/`, `apps/api/dist/`, `.turbo/` | tens of MB | Low |
| B4 | Playwright `test-results/` / reports if present | small | Low |

## Phase C — Local tooling / backups (optional, careful)

| Step | Target | Notes |
|------|--------|-------|
| C1 | `.tools/` DynamoDB Local | ~0.6 GB; re-downloadable |
| C2 | `.local-backups/` | Confirm dump not needed before delete |
| C3 | `backend/.venv/` | Recreate with poetry/pip if used |

## Phase D — Local-only risk files (quarantine / delete local)

| Step | Target | Notes |
|------|--------|-------|
| D1 | `tmp-keycloak-setup-output.txt` | Never commit; delete or move outside repo |
| D2 | `Screenshot 2026-07-14 213452qr.png` | Treat as secret-bearing; delete local after confirming no need |
| D3 | `repo-status-snapshot.txt`, `repo-tracked-files.txt` | Regenerable inventory dumps |

## Phase E — Do not auto-clean

- Untracked source under `frontend-app/src`, `apps/api`, `scripts/ops`, `docs/*.md`
- Tracked evidence already in git
- Modified tracked files listed in the tracked/untracked doc (separate review)

## Forbidden commands unless explicitly ordered later

- `git clean -fdx`
- `git add .`
- Mass-delete under `docs/evidence`
- Force-push / history rewrite for hygiene

## Recommended next action

`REVIEW_SAFE_CLEANUP_PLAN_BEFORE_EXECUTION` — start with Phase A (gitignore track + harden), then optional Phase B for disk space.
