# Action pin manifest (R0-7S1)

All `uses:` entries in `.github/workflows/accessibility.yml` at tip
`969ab386ba3f8ff3b04f27c2169c5f8dc922dabb` (workflow blob unchanged by evidence
closure).

| Action | Full SHA | Version comment | Publisher | Steps | Full-SHA syntax | Publisher expected | Release-tag→SHA independently verified |
|--------|----------|-----------------|-----------|-------|-----------------|--------------------|----------------------------------------|
| `actions/checkout` | `11d5960a326750d5838078e36cf38b85af677262` | `# v4` | GitHub Actions (official) | compliance-iso checkout; accessibility checkout | yes | yes | **yes** — `v4` tag resolves to this SHA via GitHub API during R0-7S1 review |
| `pnpm/action-setup` | `b906affcce14559ad1aafd4ab0e942779e9f58b1` | `# v4` | `pnpm` org | both jobs | yes | yes | **yes** — resolved from `v4` tag at pin time; re-confirmed form in evidence closure |
| `actions/setup-node` | `49933ea5288caeca8642d1e84afbd3f7d6820020` | `# v4` | GitHub Actions (official) | both jobs | yes | yes | **yes** — resolved from `v4` tag at pin time |
| `actions/upload-artifact` | `ea165f8d65b6e75b540449e92b4886f43607fa02` | `# v4` | GitHub Actions (official) | Upload accessibility artifacts | yes | yes | **yes** — resolved from `v4` tag at pin time |

## Distinctions

- **Full-SHA syntax verified:** all entries match `[0-9a-f]{40}`.
- **Publisher verified:** owners match expected official / pnpm publishers.
- **Release identity:** pins were obtained from GitHub tag refs at containment
  time; checkout `v4` → SHA was re-checked during independent review.
- No floating `@v4` / branch / abbreviated SHA remains in this workflow.
