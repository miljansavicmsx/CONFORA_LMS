# QA workflow pnpm alignment

File: `.github/workflows/confora-qa.yml`

| Before | After |
|--------|-------|
| `version: 9` | `version: 9.14.2` |
| Floating Action tags `@v4` / `@v0.10.0` | Full 40-character SHAs with version comments |

Job structure, triggers, scripts, and filters otherwise unchanged (including known references to untracked `@confora/database` / `@confora/worker` — deferred defects).
