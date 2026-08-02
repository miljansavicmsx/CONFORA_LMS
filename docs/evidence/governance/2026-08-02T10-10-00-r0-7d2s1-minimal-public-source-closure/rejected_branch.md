# Rejected experimental branch — inspect-only record

| Field | Value |
|-------|-------|
| Branch | `ci/r0-7d2-accessibility-baseline` |
| Tip | `13cdd75280206ec00587e5455b7c76bf7d75e269` |
| Classification | `REJECTED_EXPERIMENTAL_NOT_PR_ELIGIBLE` |
| Independent re-review | `NO-GO` |

## Allowed use

- Read commits and trees as **candidate file provenance**
- Cite evidence folder `docs/evidence/governance/2026-08-02T08-30-00-r0-7d2r-tracked-frontend-build-closure/`

## Forbidden use

- Amend / rebase / reset / force-push
- Open or merge a PR from this branch
- Use as git base for the next implementation branch
- Carry `packages/ui/dist/styles.css` or the 731-file directory promotion forward as a block

## Useful commits (reference only)

| SHA | Role |
|-----|------|
| `9e5aa70e62df1cf2520595c063b9b269c69961f5` | Original R0-7D2 a11y workflow + axe pin (partially reusable patterns) |
| `a277a19fc5d835bdf069894ecf5cd38864ef3ea4` | Unauthorized broad promotion — **do not repeat** |
| `ccc8e5f8773288e54b80b6c7ac829f0d0af8abaa` | Package resolve hacks — re-evaluate under source+ephemeral CSS strategy |
| `13cdd75280206ec00587e5455b7c76bf7d75e269` | Corrective evidence (honesty about prior failure is useful) |
