# Workflow pnpm inventory

| Workflow | Declares/installs pnpm? | Version ref | Classification | Action pin |
|----------|-------------------------|-------------|----------------|------------|
| `accessibility.yml` | yes | `9.14.2` | `PINNED_CORRECT` | full SHA (R0-7S1) |
| `ci.yml` | yes | `9.14.2` | `PINNED_CORRECT` (version) | `pnpm/action-setup@v4` **FLOATING tag** |
| `confora-qa.yml` | yes | `9` | `FLOATING` | `pnpm/action-setup@v4` **FLOATING tag** |
| `f4-frontend-cutover-gate.yml` | setup-node only | n/a | `NOT_APPLICABLE` / no pnpm setup | floating setup-node |
| `deploy-backend.yml` | no pnpm | n/a | `NOT_APPLICABLE` | — |
| `backend-*.yml` | Python | n/a | `NOT_APPLICABLE` | — |
| `release-candidate.yml` | setup-node | n/a | `NOT_APPLICABLE` for pnpm version | — |

## Exact changes required to standardize on `pnpm@9.14.2`

1. **Mandatory for consistency:** `confora-qa.yml` `version: 9` → `version: 9.14.2`.
2. **OD-R07-8 when touching workflows:** replace floating `pnpm/action-setup@v4` / `actions/setup-node@v4` with full 40-character SHAs in any workflow R0-7B2 edits.
3. Do **not** modify workflows in R0-7B1.
