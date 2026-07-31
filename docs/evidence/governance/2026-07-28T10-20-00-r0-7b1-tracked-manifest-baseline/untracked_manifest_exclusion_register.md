# Untracked manifest exclusion register

**Evidence class:** local untracked condition (working tree / filesystem).

**Rule:** No untracked manifest may be used as a lockfile-generation input for R0-7B2.

| Path | Classification | Reason |
|------|----------------|--------|
| `apps/admin/package.json` | `UNTRACKED_EXCLUDE_FROM_R0_7B` | Local untracked; stale lockfile importer exists |
| `apps/web/package.json` | `UNTRACKED_EXCLUDE_FROM_R0_7B` | Local untracked; not OD-R07-3 target |
| `apps/worker/package.json` | `UNTRACKED_EXCLUDE_FROM_R0_7B` | Local untracked |
| `apps/examiner/package.json` | `UNTRACKED_EXCLUDE_FROM_R0_7B` | Local untracked |
| `packages/database/package.json` | `UNTRACKED_EXCLUDE_FROM_R0_7B` | OD-R07-2 deferred |
| `frontend-public/package.json` | `UNTRACKED_EXCLUDE_FROM_R0_7B` | Local untracked; outside workspace globs |
| `tests/e2e/package.json` | `UNTRACKED_EXCLUDE_FROM_R0_7B` | Local untracked; outside workspace globs |
| `backend/` | `UNTRACKED_EXCLUDE_FROM_R0_7B` | OD-R07-4 FastAPI must not enter via CI reconstruction |

`git check-ignore` did not classify the above `package.json` files as ignored; they are **untracked**, not ignored.

None classified `TRACKED_VALID_INPUT` in this register (tracked inputs are listed separately).
