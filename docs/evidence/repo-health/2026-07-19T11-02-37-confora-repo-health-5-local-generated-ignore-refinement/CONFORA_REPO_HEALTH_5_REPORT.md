# CONFORA-REPO-HEALTH-5 — Report

| Field | Value |
|-------|-------|
| Evidence | `docs/evidence/repo-health/2026-07-19T11-02-37-confora-repo-health-5-local-generated-ignore-refinement/` |
| Based on | `a0b6d77` |
| Status entries | 1656 |
| Tracked clean | true |
| gitignore modified | false |
| Patch proposed | true |
| Verdict | `CONFORA_REPO_HEALTH_5_AUDIT_ONLY_READY_FOR_REVIEW` |

## Safe ignore candidates (9)

- `package-lock.json`
- `frontend-app/package-lock.json`
- `apps/api/build-log.txt`
- `apps/api/build-log2.txt`
- `scripts/ops/_tmp-repo-health-3-classify.mjs`
- `scripts/ops/_tmp-repo-health-3-emit.mjs`
- `scripts/ops/_tmp-repo-health-4-analyze.mjs`
- `scripts/ops/_tmp-repo-health-4-emit.mjs`
- `packages/shared-types/tsconfig.build.tsbuildinfo`

## Proposed R2 patterns

```
package-lock.json
apps/api/build-log*.txt
scripts/ops/_tmp-repo-health-*.mjs
*.tsbuildinfo
**/*.tsbuildinfo
```

## Guards

- `docs/evidence` not proposed for ignore
- Source directories not proposed for ignore

## Final verdict

`CONFORA_REPO_HEALTH_5_AUDIT_ONLY_READY_FOR_REVIEW`
