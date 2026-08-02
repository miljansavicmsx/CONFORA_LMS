# Owner decisions required

| # | Question | Recommended answer | Justification |
|---|----------|--------------------|---------------|
| 1 | Static, browser, or staged first? | **Staged (Plan C)** | Separates claims |
| 2 | Promote untracked a11y scripts? | **No by default** | Untracked ≠ approved |
| 3 | Contrast blocking? | **Defer then Option B** | Step currently broken |
| 4 | Ruleset? | **axe wcag22aa** + token 1.4.3/1.4.11 | Platform WCAG 2.2; no full-conformity claim |
| 5 | Fixed ephemeral demo credentials? | **Avoid for first recovery** | Log-surface risk |
| 6 | PR comments vs artifacts? | **Artifacts only** | Least privilege |
| 7 | Keep pull-requests: write? | **No** if comments removed | Least privilege |
| 8 | Keep compliance-iso in file? | **Yes temporarily** | Do not repair in R0-7D |
| 9 | Max runtime? | **≤20 min** | Current timeout |
| 10 | A11y rule ownership? | **Frontend + compliance jointly** | Needs named owners |

Recommendations only — not silent approvals.
