# Owner decisions applied (binding)

| Decision | Application in R0-7B1 |
|----------|------------------------|
| **OD-R07-1** | Planning requires lockfile regeneration only from tracked manifests in an isolated clean worktree using pnpm `9.14.2`. Experiment performed; regeneration deferred to R0-7B2. |
| **OD-R07-2** | `packages/database` classified `UNTRACKED_EXCLUDE_FROM_R0_7B`; must not influence reconstructed lockfile. |
| **OD-R07-3** | Accessibility authoritative target remains tracked `frontend-app` (not untracked `apps/web`). Note: `frontend-app` is **outside** current workspace globs — owner decision may be required for workspace policy in R0-7B2. |
| **OD-R07-4** | FastAPI `backend/` must not be introduced through CI reconstruction; excluded from lockfile inputs. |
| **OD-R07-8** | Any workflow modified in R0-7B2 must use immutable full-SHA Action pins. |

## Owner decisions still required before / during R0-7B2

1. Whether to add `frontend-app` to `pnpm-workspace.yaml` so the authoritative a11y app is a workspace member on clean clones.
2. Whether R0-7B2 scope includes pinning `pnpm/action-setup` / `actions/setup-node` SHAs in `ci.yml` and `confora-qa.yml` when correcting pnpm versions (OD-R07-8).
3. Confirmation that root `jsqr` / `pngjs` lockfile-only entries should be **removed** (not added to root `package.json`) unless a tracked consumer is identified.
