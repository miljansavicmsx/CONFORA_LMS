# CONFORA-REPO-HEALTH-3 — Summary

| Item | Value |
|------|-------|
| Task | `CONFORA_REPO_HEALTH_3_UNTRACKED_SOURCE_CLASSIFICATION` |
| Based on commit | `e6ab85d` |
| Branch | `fix/ca-h01-frontend-f4-cutover` |
| HEAD at audit | `e6ab85d` |
| Audit only | true |
| Cleanup executed | false |
| Final verdict | `CONFORA_REPO_HEALTH_3_AUDIT_ONLY_READY_FOR_REVIEW` |

## Measured counts

| Metric | Count |
|--------|------:|
| Tracked files | 718 |
| Status entries | 1674 |
| Modified tracked | 8 |
| Untracked entries | 1666 |
| Source-candidate files (heuristic) | 719 |
| Generated-pattern untracked | 1 |
| Risk path / content-pattern unique paths | 75 |

## Headline

1. Working tree still has **~1.6k untracked** paths vs **718 tracked** — mostly real source/docs/evidence, not regenerable junk (HEALTH-2 ignore already hid deps/tools).
2. Largest untracked groups: `docs/` (708), `frontend-app/` (460), `scripts/` (246), `apps/` (194).
3. Modified tracked: **8** — 5 with real appeals/complaints nav/i18n deltas; 3 appear line-ending-only / no content diff.
4. Next action: review classification before any broad tracking or cleanup.
