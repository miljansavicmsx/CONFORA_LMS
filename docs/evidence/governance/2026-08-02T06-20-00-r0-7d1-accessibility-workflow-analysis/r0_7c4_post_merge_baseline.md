# R0-7C4 post-merge baseline

- Merge commit: `4090be85a0f8e423d199610f82e3949c899cc90b`
- Classification: IMMUTABLE PGVECTOR VERIFICATION ACTIVE
- Accessibility workflow blob at tip: `60183e8df396e68fde091f3aa27fe6b84de5e43e`
- Same blob as PR #7 head `2559096d`
- PostgreSQL services retain approved digest: `pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b`
- Accessibility job does not use postgres service
- Compliance-iso job uses digest-pinned postgres and fails later at packages/database
