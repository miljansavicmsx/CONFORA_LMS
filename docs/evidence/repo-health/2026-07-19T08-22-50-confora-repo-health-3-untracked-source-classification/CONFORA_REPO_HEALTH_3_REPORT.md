# CONFORA-REPO-HEALTH-3 — Report

| Field | Value |
|-------|-------|
| Evidence | `docs/evidence/repo-health/2026-07-19T08-22-50-confora-repo-health-3-untracked-source-classification/` |
| Based on | `e6ab85d` |
| Tracked | 718 |
| Status entries | 1674 |
| Modified | 8 |
| Untracked | 1666 |
| Verdict | `CONFORA_REPO_HEALTH_3_AUDIT_ONLY_READY_FOR_REVIEW` |

## Modified tracked

5 files: likely intended appeals/complaints nav + i18n.  
3 files: likely CRLF-only / no content diff.

## Biggest untracked groups

1. `docs` — 708
1. `frontend-app` — 460
1. `scripts` — 246
1. `apps` — 194
1. `packages` — 21

## Source candidates (heuristic counts)

- `root_config`: 14
- `.github`: 1
- `.husky`: 1
- `apps/api/src`: 54
- `apps/api/test`: 64
- `frontend-app/e2e`: 55
- `frontend-app/src`: 329
- `packages`: 7
- `prisma`: 1
- `scripts/ops`: 193

## Generated/local

Few untracked generated matches (1); HEALTH-2 ignore is doing the heavy lifting. Do not track `apps/api/build-log.txt`.

## Risk

- Path risks: 3
- Content-pattern paths: 72 (mostly code identifiers; review MFA otpauth-related ops before tracking)
- Unique risk-union paths: 75

## Recommended next commits

See `CONFORA_REPO_HEALTH_3_RECOMMENDED_NEXT_COMMITS.md` — start with optional nav/i18n commit and/or workspace meta; never `git add .`.

## Final verdict

`CONFORA_REPO_HEALTH_3_AUDIT_ONLY_READY_FOR_REVIEW`
