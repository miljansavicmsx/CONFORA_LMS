# CONFORA-REPO-HEALTH-21 — Status Baseline

| Check | Result |
|-------|--------|
| Branch | `fix/ca-h01-frontend-f4-cutover` |
| HEAD short | `278d4af5` |
| HEAD full | `278d4af5a1a20c1de81aa39dbe39ea3218d9d3d1` |
| HEAD message | `docs(repo): add w2d1 ui import verification evidence` |
| `origin/fix/ca-h01-frontend-f4-cutover` | `278d4af5` |
| Remote contains HEAD | **yes** (`merge-base --is-ancestor` exit 0) |
| Dirty tracked files | **0** |
| Staged files | **0** |
| `git add .` used | **false** |
| Porcelain entry count | 1618 (untracked residual only) |
| RH20 evidence | `docs/evidence/repo-health/2026-07-22T21-51-49-confora-repo-health-20-w2d1-ui-import-verification/` |

## Scope file status

| Path | Tracked | Untracked | Bytes | SHA-256 |
|------|---------|-----------|-------|---------|
| `packages/ui/src/ai-disclosure.tsx` | false | **true** | 1238 | `7dda3a96d72fd138d84fe7669ec51bb6f91a84126684383110e45b53e30379b0` |
| `packages/ui/src/index.ts` | false | **true** | 217 | `c1608f02fd273f9ad87bac2fa15d935a3aec19998188a26b2db12b876af0e884` |

## Already imported (W2D-1) — out of rework import scope

Tracked under `packages/ui/`:

- `package.json`, `postcss.config.cjs`, `tailwind.config.ts`, `tsconfig.json`, `tsconfig.build.json`
- `tokens.ts`
- `src/button.tsx`
- `src/skip-to-main-link.tsx`
- `src/styles.css`

## Deferred (unchanged)

- `packages/notification-templates/**` — **9** untracked paths; not reviewed; not imported.

## Constraints confirmed for this task

- Audit/report only — no source edits
- No staging / commit of source
- No import of `ai-disclosure.tsx` or `index.ts`
- No `package.json` / lockfile / `.gitignore` changes
- No install/build/lifecycle scripts
- No browser execution of UI code
- No external pilot / security / DPO-legal approval claimed
