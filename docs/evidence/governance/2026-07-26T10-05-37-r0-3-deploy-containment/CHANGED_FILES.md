# Changed files

## Intended repository changes (this task)

1. `.github/workflows/deploy-backend.yml`

## Evidence package (new, untracked)

`docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/**`

## Confirmed not modified

- application source under `apps/**` (except the workflow file above under `.github/`)
- `packages/**` source
- Prisma schemas / migrations
- runtime configuration (`.env`, app configs)
- other workflow files under `.github/workflows/`

## Note on porcelain noise

`git status --porcelain -uno` may still show ` M` on older `docs/evidence/repo-health/**` files. Content hashes match HEAD (`same=74 differs=0`); cause is `core.autocrlf=true` without `.gitattributes`. Those files were not staged and are not part of R0-3.
