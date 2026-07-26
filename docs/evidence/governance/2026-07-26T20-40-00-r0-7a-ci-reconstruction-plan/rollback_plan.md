# Rollback plan

## R0-7A (this package)

Delete planning branch or revert evidence commit; no runtime impact.

## Future R0-7B–E

- Revert workflow/lockfile commits via PR reverse merge
- Keep R0-3 deploy containment untouched
- Do not force-push integration branch
- Preserve audit history of failed CI as evidence of R0-7 necessity
