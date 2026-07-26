# Root cause register

| ID | Type | Summary | Evidence | Affects | Blocks |
|----|------|---------|----------|---------|--------|
| RC-R07-1 | CI config + repo defect | Lockfile/manifest drift (`jsqr`/`pngjs`); untracked workspace importers in lock | PR #3 quality/a11y install logs; tracked file diff | quality, accessibility, confora-qa | R0-7B first |
| RC-R07-2 | Missing tracked source | `packages/database` 0 tracked files | `git ls-files` | database, compliance-iso, QA | After service recovery |
| RC-R07-3 | CI config defect | pgvector service create exit 125; likely unquoted health-cmd | PR #3 database/compliance logs | database, compliance-iso | R0-7C |
| RC-R07-4 | Missing tracked source | `scripts/a11y/*.mjs` untracked | MODULE_NOT_FOUND; ls-files 0 | accessibility | R0-7D |
| RC-R07-5 | Architecture contradiction | A11y assumes FastAPI + untracked Next apps | workflow + compose + SoT | accessibility | R0-7D design |
| RC-R07-6 | Symptom | docker job skipped via `needs` | Actions behavior | docker | After quality+database |
| RC-R07-7 | Missing tracked source | Dockerfiles untracked | ls-files 0 | docker | Later image task |
| RC-R07-8 | Legacy / OD | backend workflows vs untracked FastAPI | ls-files 0; R0-3 | backend-* , RC | Owner OD |
| RC-R07-9 | Security | a11y contents:write + push | workflow permissions | accessibility | R0-7D/F |
| RC-R07-10 | Supply chain | mutable tags / unpinned actions | workflow YAML | multiple | pin during fixes |
| RC-R07-11 | CI config | confora-qa pnpm `version: 9` floating | workflow | QA | R0-7B/E |
| RC-R07-12 | Architecture | apps/api incomplete — post-install quality will still fail | SoT + no main.ts | quality e2e/build | OQ-3 / lanes |
| RC-R07-13 | Env limitation | Local pnpm 9.15 vs declared 9.14.2 may worsen drift | host vs packageManager | lock regen risk | R0-7B discipline |
