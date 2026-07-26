# Commands Executed

All commands were read-only inspections. Shell: PowerShell on Windows. Working directory: `C:\Users\milja\Desktop\CONFORA_LMS`.

The only write operations in this task were the creation of the 17 files inside
`docs/evidence/governance/2026-07-26T08-43-21-repository-rules-rebaseline/`.

---

## 1. Evidence folder creation and repository identity

```powershell
$ts = Get-Date -Format "yyyy-MM-ddTHH-mm-ss"            # → 2026-07-26T08-43-21
$dir = "docs/evidence/governance/$ts-repository-rules-rebaseline"
New-Item -ItemType Directory -Force -Path $dir

(Get-Location).Path
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git rev-parse --short=8 HEAD
git remote -v
git rev-parse --abbrev-ref '@{upstream}'
git status -sb | Select-Object -First 1
```

Results: path `C:\Users\milja\Desktop\CONFORA_LMS`; branch `fix/ca-h01-frontend-f4-cutover`; HEAD `e27cdc0501bbd9f931d0e71f653ffc5f0d88d1bb` / `e27cdc05`; remote `origin https://github.com/miljansavicmsx/CONFORA_LMS.git`; upstream `origin/fix/ca-h01-frontend-f4-cutover`, in sync.

## 2. Status counts

```powershell
(git diff --cached --name-only | Measure-Object).Count                    # 0
(git diff --name-only | Measure-Object).Count                             # 0
(git ls-files --deleted | Measure-Object).Count                           # 0
(git status --porcelain --untracked-files=normal |
   Where-Object { $_ -match '^\?\?' } | Measure-Object).Count             # 1439
(git ls-files | Measure-Object).Count                                     # 1404
```

## 3. Commit log and root structure

```powershell
git log --oneline -20
git ls-files | ForEach-Object { ($_ -split '/')[0] } |
  Group-Object | Sort-Object Count -Descending
Get-ChildItem -Force -Directory
Get-ChildItem -Force -File
```

## 4. `git_status_before.txt` capture

```powershell
$d = "docs/evidence/governance/2026-07-26T08-43-21-repository-rules-rebaseline"
git status -sb | Select-Object -First 1        > "$d/git_status_before.txt"   # (appended sections)
git diff --cached --name-only                 >> "$d/git_status_before.txt"
git diff --name-only                          >> "$d/git_status_before.txt"
git ls-files --deleted                        >> "$d/git_status_before.txt"
git status --porcelain -uno                   >> "$d/git_status_before.txt"
git status --porcelain --untracked-files=normal >> "$d/git_status_before.txt"
```

Result: 1595 lines.

**Disclosure:** the evidence directory was created in step 1, before this capture. `git_status_before.txt` therefore already lists `?? docs/evidence/governance/` (git collapses untracked directories to a single entry). The directory was empty at capture time. Both before and after files are 99737 bytes and compare **identical** once lines matching `repository-rules-rebaseline` are excluded — see step 9.

## 5. Structural detail

```powershell
(git status --porcelain -uno | Measure-Object).Count                       # 74
git ls-files docs | ForEach-Object { ($_ -split '/')[1] } | Sort-Object -Unique   # → evidence (only)
Get-ChildItem docs -Directory
Get-ChildItem apps -Directory     | ForEach-Object { git ls-files "apps/$($_.Name)" }
Get-ChildItem packages -Directory | ForEach-Object { git ls-files "packages/$($_.Name)" }
git ls-files .github
Get-Content pnpm-workspace.yaml
```

## 6. CRLF / phantom-dirty investigation

```powershell
(git diff --name-only | Measure-Object).Count           # 0
(git diff HEAD --name-only | Measure-Object).Count      # 0
git status --porcelain -uno | Select-Object -First 3

# content identity check across all 74 flagged files
$files = @(git status --porcelain -uno | ForEach-Object { ($_ -replace '^\s*M\s+','').Trim() })
foreach ($f in $files) {
  $a = git hash-object $f
  $b = git rev-parse "HEAD:$f"
  if ($a -eq $b) { $same++ } else { $diff++ }
}
# → same=74 differs=0

git config core.autocrlf     # true
Test-Path .gitattributes     # False
```

## 7. Deep inspections (parallel read-only subagents)

Six exploration passes were run, each restricted to reading and searching. Each was instructed to verify tracked status with `git ls-files --error-unmatch <path>` for every finding and to classify conclusions as VERIFIED / PARTIALLY VERIFIED / ASSUMED / NOT FOUND / CONTRADICTED.

| # | Area | Output file |
|---|------|-------------|
| 1 | Canonical vs legacy applications | `canonical_legacy_inventory.md` |
| 2 | Database and persistence | `database_persistence_inventory.md` |
| 3 | Identity, RBAC, SoD, tenancy | `identity_rbac_sod_inventory.md`, `tenant_isolation_inventory.md` |
| 4 | Audit ledger and evidence | `audit_evidence_inventory.md` |
| 5 | Testing and CI | `testing_ci_inventory.md` |
| 6 | Governance docs and generated files | `existing_governance_inventory.md`, `generated_files_inventory.md` |

Representative command classes used within those passes:

```powershell
git ls-files <dir>
git ls-files --error-unmatch <path>          # tracked/untracked determination
git check-ignore -v <path>                   # ignore-rule attribution
git log --oneline -- <path>                  # history presence
Test-Path <path>                             # on-disk presence
rg <pattern> --glob '!node_modules' ...      # content search
```

Key search patterns: `canonical`, `legacy`, `deprecat`, `cutover`; `tenant_id`, `tenantId`, `TENANT_SCOPED_PRISMA_MODELS`; `PrismaClient`, `$queryRaw`, `datasource db`, `boto3`, `dynamodb`; `keycloak`, `cognito`, `require_permission`, `RolesGuard`, `sod`, `conflict_of_interest`; `AuditEvent`, `prev_hash`, `append.only`, `ROW LEVEL SECURITY`, `redact`, `createAuditClient`.

## 8. Final state capture and non-modification proof

```powershell
git status --porcelain -uno                      > git_status_after.txt   # (appended sections)
git diff --cached --name-only                   >> git_status_after.txt
git diff --name-only                            >> git_status_after.txt
git status --porcelain --untracked-files=normal >> git_status_after.txt
```

## 9. Verification of invariants

```powershell
(git diff --cached --name-only | Measure-Object).Count   # 0   (unchanged)
(git diff --name-only | Measure-Object).Count            # 0   (unchanged)
(git ls-files --deleted | Measure-Object).Count          # 0   (unchanged)
(git ls-files | Measure-Object).Count                    # 1404 (unchanged)
(git status --porcelain -uno | Measure-Object).Count     # 74  (unchanged, CRLF noise)
git rev-parse --short=8 HEAD                             # e27cdc05 (unchanged)

$b = Get-Content git_status_before.txt | Where-Object { $_ -notmatch 'repository-rules-rebaseline' }
$a = Get-Content git_status_after.txt  | Where-Object { $_ -notmatch 'repository-rules-rebaseline' }
Compare-Object $b $a
# → no output: IDENTICAL, no change outside the evidence folder
```

Evidence folder contents verified: **17 files**, matching the required output list exactly.

---

## Commands deliberately NOT run

To preserve the audit-only guarantee, none of the following were executed:

```text
git add <anything>
git commit / git stash / git checkout / git restore / git reset
git clean
Remove-Item / Move-Item / Set-Content on any repository file outside the evidence folder
pnpm install / pnpm build / prisma generate / prisma migrate
any test suite, linter with --fix, or formatter with --write
any command touching .gitignore, .cursor/**, docs/governance/**, docs/architecture/**
```

No file outside `docs/evidence/governance/2026-07-26T08-43-21-repository-rules-rebaseline/` was created, modified, deleted or staged.
