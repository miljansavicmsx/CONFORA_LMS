# Rollback plan

1. Revert the implementation commit restoring prior `pnpm-lock.yaml` and `confora-qa.yml`.
2. Revert evidence commit if required for history hygiene.
3. Do not force-push shared integration history.
