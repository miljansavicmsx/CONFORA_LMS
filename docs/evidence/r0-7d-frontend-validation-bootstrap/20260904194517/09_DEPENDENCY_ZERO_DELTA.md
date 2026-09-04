# 09_DEPENDENCY_ZERO_DELTA

## Observed deltas vs base `32ac270e256720b447450913d7e301c1d905ab47`

- `BOOTSTRAP_EXTERNAL_DEPENDENCY_DELTA` = 0
- `BOOTSTRAP_MANIFEST_DELTA` = 0
- `BOOTSTRAP_LOCKFILE_DELTA` = 0
- `BOOTSTRAP_NPMRC_DELTA` = 0
- `frontend-app/package-lock.json` present = false
- `BOOTSTRAP_BACKEND_PRODUCTION_PATH_DELTA` = 0
- `BOOTSTRAP_BACKEND_ROUTE_DELTA` = 0
- `BOOTSTRAP_SCHEMA_DELTA` = 0
- `BOOTSTRAP_MIGRATION_DELTA` = 0

## Install commands used

- Root: `corepack pnpm@9.14.2 install --frozen-lockfile`
- Frontend: `npm install --package-lock=false`

No package.json, pnpm-lock.yaml, or `.npmrc` changes were committed.
