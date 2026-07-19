# GitHub + Husky review

## `.github/workflows` (8 files)

- `.github/workflows/accessibility.yml`
- `.github/workflows/backend-nightly.yml`
- `.github/workflows/backend-tests.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/confora-qa.yml`
- `.github/workflows/deploy-backend.yml`
- `.github/workflows/f4-frontend-cutover-gate.yml`
- `.github/workflows/release-candidate.yml`

### Secret-reference scan (no values)

| Workflow | Uses `secrets.` context | Mentions secret-ish words | JWT literals | Hardcoded secret assignments |
|----------|:------------------------:|:-------------------------:|-------------:|-----------------------------:|
| `.github/workflows/accessibility.yml` | true | true | 0 | 0 |
| `.github/workflows/backend-nightly.yml` | false | false | 0 | 0 |
| `.github/workflows/backend-tests.yml` | false | false | 0 | 0 |
| `.github/workflows/ci.yml` | false | true | 0 | 0 |
| `.github/workflows/confora-qa.yml` | false | false | 0 | 0 |
| `.github/workflows/deploy-backend.yml` | true | false | 0 | 0 |
| `.github/workflows/f4-frontend-cutover-gate.yml` | false | false | 0 | 0 |
| `.github/workflows/release-candidate.yml` | false | false | 0 | 0 |

**Finding:** Workflows reference GitHub Actions secrets context where needed; **no** JWT-like literals or hardcoded password/token assignments detected in YAML.

## `.husky`

- `.husky/commit-msg`
- `.husky/pre-commit`

- `pre-commit`: runs `pnpm exec lint-staged` + `pnpm typecheck`
- `commit-msg`: present (commitlint-oriented)
- Root `package.json` `"prepare": "husky"` aligns with tracking `.husky/`

## Classification

| Path | Class |
|------|-------|
| `.github/` | recommended to track now |
| `.husky/` | recommended to track now |
