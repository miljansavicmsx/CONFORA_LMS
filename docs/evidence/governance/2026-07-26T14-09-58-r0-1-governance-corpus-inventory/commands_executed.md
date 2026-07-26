# Commands executed — R0-1A

**Evidence folder:** `docs/evidence/governance/2026-07-26T14-09-58-r0-1-governance-corpus-inventory/`
**Date (local):** 2026-07-26

All commands were read-only with respect to application code, workflows, schemas, migrations, runtime configuration, Cursor rules, and existing tracked evidence. No governance documents were promoted or committed.

## Synchronization and identity

```text
git fetch origin
git rev-parse origin/fix/ca-h01-frontend-f4-cutover
→ 1f141fe18aafafd0405b1539788234d253f40f4b

gh pr view 1 --json state,mergedAt,mergeCommit
→ state=MERGED; mergeCommit=1f141fe18aafafd0405b1539788234d253f40f4b; mergedAt=2026-07-26T11:56:34Z

git status --porcelain -uno
→ (empty — tracked working tree clean)

git branch --show-current
→ governance/r0-3-deploy-containment

git rev-parse HEAD
→ 91ca6fcece33f95240322d6ad3bb38cf3af6cef6
```

Note: local HEAD remains on the merged R0-3 feature branch tip (ancestor of the merge). No checkout, merge, rebase, reset, clean, or force was performed.

## Inventory commands

```text
git ls-files docs/governance
→ (empty)

git ls-files docs/architecture
→ (empty)

git ls-files AGENTS.md
→ AGENTS.md

git check-ignore -v docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md
  docs/architecture/CANONICAL_COMPONENT_REGISTRY.md
  docs/architecture/decisions/ADR-001-frontend.md
  AGENTS.md
→ exit 1 (not ignored) for governance/architecture samples; AGENTS.md tracked

git ls-files docs/evidence/governance/ | Measure-Object
→ 21 tracked files (all under R0-3 package)

git status --porcelain docs/evidence/governance/2026-07-26T08-43-21-repository-rules-rebaseline
git status --porcelain docs/evidence/governance/2026-07-26T09-38-03-owner-decision-package
→ both ?? (untracked evidence packages)

Filesystem enumeration of docs/governance/, docs/architecture/, docs/*.md ISO/AI/SECURITY/MULTI/SHARED patterns, and root CONFORA_* files.
```

## Evidence package creation

```text
New-Item ... 2026-07-26T14-09-58-r0-1-governance-corpus-inventory
git status --porcelain | Out-File git_status_before.txt
# subsequent Write of required markdown/json evidence files only
# git_status_after.txt captured after evidence files written
```

## Explicitly not executed

- No `git add` / `git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>"` / `git push` of governance corpus
- No promotion of `docs/governance/**` or `docs/architecture/**` into the index
- No modification of `.gitignore`, workflows, application code, schemas, migrations, runtime config, or `.cursor/rules/**`
- No GitHub Environment settings changes
- No production workflow dispatch
