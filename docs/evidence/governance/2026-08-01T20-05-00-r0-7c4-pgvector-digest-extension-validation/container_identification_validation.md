# Container identification validation

Method: filter running containers where `docker inspect Config.Image` equals:

`pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b`

Require exactly one match.

Local observation: `Config.Image` preserves the full `tag@digest` string
(not normalized away). Selection is deterministic.
