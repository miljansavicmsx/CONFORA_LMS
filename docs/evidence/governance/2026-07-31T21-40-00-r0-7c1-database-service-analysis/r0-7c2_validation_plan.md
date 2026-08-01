# R0-7C2 validation plan (GO criteria)

1. Docker service container created successfully (no exit 125).
2. Container remains running.
3. PostgreSQL responds to `pg_isready`.
4. Health check reaches healthy.
5. Auth succeeds with ephemeral CI credentials.
6. Target test database `confora` exists.
7. pgvector extension binaries available (`pg_available_extensions`).
8. Extension enablement in ephemeral DB — only if owner-approved step exists.
9. No Prisma command required for GO of boot recovery.
10. No untracked repository file required for GO of boot recovery.
11. No production database accessed.
12. No deployment workflow runs.

R0-7C2 GO for **service boot** does **not** require database job green end-to-end
while `packages/database` remains untracked.
