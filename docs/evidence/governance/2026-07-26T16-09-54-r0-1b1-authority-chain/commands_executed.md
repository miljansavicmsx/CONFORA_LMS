# Commands executed — R0-1B1

Read-only verification and controlled promotion commands (PowerShell on Windows).

## Preliminary verification
- `git fetch origin`
- `git rev-parse origin/fix/ca-h01-frontend-f4-cutover` → `1f141fe18aafafd0405b1539788234d253f40f4b`
- `git status --porcelain -uno` → empty (clean tracked tree)
- `git ls-files <8 normative targets>` → empty (none tracked)
- `gh pr view 1 --json state,mergedAt` → `MERGED`, `2026-07-26T11:56:34Z`

## Branch
- `git checkout -b governance/r0-1b1-authority-chain 1f141fe18aafafd0405b1539788234d253f40f4b`
- `git status --porcelain` → captured to `git_status_before.txt`

## Authoring / rebaseline
- Edited `docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md` (added §0 addendum).
- Rewrote `docs/governance/GOVERNANCE_HIERARCHY.md` (7-level order).
- Authored `ENGINEERING_CONSTITUTION.md`, `OWNER_DECISION_REGISTER.md`, `OWNER_DECISION_PACKAGE.md`, `CHANGE_CONTROL.md`, `STANDARDS_REFERENCE_POLICY.md`.
- Added non-normative status notices to three evidence READMEs.

## Validation
- JSON parse of R0-1B1 `*.json` → PASS.
- Regex scan of normative corpus for `](...)` relative links → `BROKEN_LINKS=0`.
- Confirmed no `AGENTS.md` change required (line 7 already references tracked Baseline path).

## Commit 1 (normative)
- `git add <8 governance files>`
- `git diff --cached --name-only` → 8 files, all under `docs/governance/`
- `git commit -m "docs(governance): establish confora authority chain"` → `4fd42eab1f5c508bae373abe6a80d301be060e9b`

## Commit 2 (evidence)
- `git add docs/evidence/governance/2026-07-26T08-43-21-repository-rules-rebaseline docs/evidence/governance/2026-07-26T09-38-03-owner-decision-package docs/evidence/governance/2026-07-26T14-09-58-r0-1-governance-corpus-inventory docs/evidence/governance/2026-07-26T16-09-54-r0-1b1-authority-chain`
- `git diff --cached --name-only` → all under `docs/evidence/governance/`
- `git commit -m "docs(repo): add r0-1 governance promotion evidence"`
- `git status --porcelain` → captured to `git_status_after.txt`

## Push
- `git push -u origin governance/r0-1b1-authority-chain` (after both commits + verification)
