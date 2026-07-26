# Repository Identity

**Classification: VERIFIED** (all values read directly from git)

## Core identity

| Attribute | Value |
|-----------|-------|
| Absolute path | `C:\Users\milja\Desktop\CONFORA_LMS` |
| Current branch | `fix/ca-h01-frontend-f4-cutover` |
| HEAD (full) | `e27cdc0501bbd9f931d0e71f653ffc5f0d88d1bb` |
| HEAD (short) | `e27cdc05` |
| HEAD subject | `docs(repo): add post-w2g remaining deferred rebaseline` |
| Upstream | `origin/fix/ca-h01-frontend-f4-cutover` |
| Sync state | In sync (local HEAD == remote HEAD; ahead 0, behind 0) |
| Default/base branch | Not `main` — all recent work is on the feature branch above |

## Remote configuration

```text
origin  https://github.com/miljansavicmsx/CONFORA_LMS.git (fetch)
origin  https://github.com/miljansavicmsx/CONFORA_LMS.git (push)
```

Single remote, HTTPS, no fork/upstream pair configured.

## Status counts

| Category | Count |
|----------|------:|
| Staged files | **0** |
| Tracked modified (`git diff --name-only`) | **0** |
| Tracked modified vs HEAD (`git diff HEAD --name-only`) | **0** |
| Deleted (`git ls-files --deleted`) | **0** |
| `git status --porcelain -uno` entries | **74** (see anomaly below) |
| Untracked entries (`--untracked-files=normal`) | **1439** |
| Total tracked files (`git ls-files`) | **1404** |

### Status anomaly — CRLF stat noise (**VERIFIED**, finding)

`git status --porcelain -uno` reports 74 files under `docs/evidence/repo-health/**` (RH37–RH41 packs) as ` M`, yet `git diff --name-only` and `git diff HEAD --name-only` both return **0**.

Content identity check across all 74:

```text
same=74  differs=0
```

Every one hashes (`git hash-object`) identically to its `HEAD:` blob. Root cause:

```text
core.autocrlf = true
.gitattributes exists = False
```

With `core.autocrlf=true` and **no `.gitattributes`**, line-ending normalisation makes `git status`'s stat cache flag files that `git diff`'s filter then reports as unchanged. **No tracked content is modified.**

**Governance finding:** a cross-platform repository with `core.autocrlf=true` and no `.gitattributes` will produce persistent phantom-dirty status. This is a rebaseline candidate (add a normalisation policy), not a defect introduced by this audit.

## Latest 20 commits

```text
e27cdc05 docs(repo): add post-w2g remaining deferred rebaseline
40f80e97 docs(repo): add ai-client import verification
f2270fdf chore(repo): add safe ai client source subset
1b9179ae docs(repo): add ai-client audit review
2096d944 docs(repo): add remaining source package rebaseline
68f099e0 docs(repo): add apps api ai source reconciliation audit
4f2cbe12 docs(repo): add apps api ai-prompts compatibility audit
d15bd2d3 docs(repo): add ai-prompts package import verification
fd12b4ee docs(repo): add ai-prompts loader rework verification
f6d010ab chore(repo): add safe ai prompts package
f61e8ad7 docs(repo): add ai-prompts audit review
4587e0f3 docs(repo): add i18n package closeout review
6309719e docs(repo): add i18n locale rework verification
dbb50fe9 fix(i18n): align locale parity and translations
40928743 docs(repo): add i18n integrity review
f1cbfa97 docs(repo): add post-w2d package rebaseline
e8873390 docs(repo): add notification templates closeout review
f108f196 docs(repo): add english mjml import verification
68a32acd chore(repo): add english mjml notification templates
c87b736f docs(repo): add mjml templates audit review
```

### Commit-history observation (**VERIFIED**)

The visible history is dominated by an incremental **repo-health import programme**: audit (`docs(repo): ... audit review`) → controlled import (`chore(repo): add safe ...`) → import verification. Only three commits in the last 20 add source (`f6d010ab`, `f2270fdf`, and the i18n fix `dbb50fe9`); the rest add evidence.

This matters for the rebaseline: the repository is **mid-reconstruction**. Source is being re-admitted package-by-package under audit gates, which explains — but does not resolve — the large untracked surface documented throughout this package.
