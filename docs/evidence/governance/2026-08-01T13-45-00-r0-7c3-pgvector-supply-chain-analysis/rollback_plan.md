# Rollback plan (for future R0-7C4 only)

R0-7C3 is evidence-only — nothing operational to roll back.

Future R0-7C4 rollback: restore prior `image: pgvector/pgvector:pg16` and remove
extension validation steps via revert of the R0-7C4 workflow commit(s).
