# GitHub check inventory

Source: `gh pr view 8 --json statusCheckRollup` at evidence capture on head
`011f652673a2a50dd71044e52ae9c2624cec4be5`.

| Check | Workflow | Conclusion |
|-------|----------|------------|
| compliance-iso | Accessibility CI | FAILURE |
| quality | CI | FAILURE |
| f4-frontend-cutover | F4 Frontend Cutover Gate | FAILURE |
| accessibility | Accessibility CI | FAILURE |
| database | CI | FAILURE |
| docker | CI | SKIPPED |

Associated workflow runs (event `pull_request`, headSha `011f6526…`):

- `30764247813` — F4 Frontend Cutover Gate — failure
- `30764247793` — CI — failure
- `30764247807` — Accessibility CI — failure

PR-caused blocking failure count: **0** (see `baseline_failure_attribution.md`).
