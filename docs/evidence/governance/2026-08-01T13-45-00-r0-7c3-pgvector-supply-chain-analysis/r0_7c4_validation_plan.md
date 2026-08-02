# R0-7C4 validation plan (GO criteria draft)

1. Workflow image reference uses approved immutable digest (not bare mutable tag).
2. Service still creates and reaches `healthy` (R0-7C2 quoting preserved).
3. `pg_available_extensions` shows `vector` with expected default_version **0.8.6**.
4. If owner approved activation: `CREATE EXTENSION vector` succeeds in ephemeral DB.
5. `installed_version` populated only after create.
6. No Prisma commands executed.
7. No `packages/database` path required.
8. No production DB access; deploy-backend count remains 0.
9. Retries remain `10` unless owner changes them.
