# Commands executed (R0-7A)

1. `git fetch origin`
2. Verify `origin/fix/ca-h01-frontend-f4-cutover` == `c6110f417b3c602dc031dacbc422f8a044129cfc`
3. Verify PR #3 MERGED
4. `git status --porcelain --untracked-files=no` (clean)
5. `git checkout -B governance/r0-7a-ci-reconstruction-plan c6110f41…`
6. Read all `.github/workflows/*.yml`
7. `git ls-files` path counts; parse `package.json` vs `pnpm-lock.yaml` importers
8. Inspect PR #3 check conclusions and prior failed job log signatures
9. Author evidence package only; commit; push planning branch
