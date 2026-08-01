# Commands executed

```text
git fetch origin
git rev-parse origin/fix/ca-h01-frontend-f4-cutover
git rev-parse origin/fix/ca-h01-frontend-f4-cutover^1 ^2
gh pr view 6
git checkout -B governance/r0-7c3-pgvector-supply-chain-analysis fdd813c0a97d8dd334a2aaedb6ea3dddbdb1d04a

docker buildx imagetools inspect pgvector/pgvector:pg16
docker manifest inspect pgvector/pgvector:pg16
docker buildx imagetools inspect pgvector/pgvector:pg16@sha256:84a355869251af1a3379cfc9fa7b4dbf962c03f642a4bb7b339a203925071c43 --raw
docker image inspect pgvector/pgvector:pg16

# ephemeral container (no host bind mounts for repo; Docker named volume for PGDATA only)
docker run -d --name r07c3-ext* -e POSTGRES_* pgvector/pgvector:pg16
psql: SELECT from pg_available_extensions; CREATE EXTENSION vector; cleanup
```

No Prisma, migrate, seed, workflow edit, or production commands.
No unpinned third-party binary installs (`cosign`/`skopeo` not present; not installed).


## R0-7C3A commands

```text
git fetch origin
git checkout governance/r0-7c3-pgvector-supply-chain-analysis
docker buildx imagetools inspect pgvector/pgvector:pg16
docker buildx imagetools inspect pgvector/pgvector:pg16@sha256:84a355869251af1a3379cfc9fa7b4dbf962c03f642a4bb7b339a203925071c43 --raw
docker run -d --platform linux/amd64 --name r07c3a-amd64-ver \
  -e POSTGRES_USER=confora -e POSTGRES_PASSWORD=<ephemeral> -e POSTGRES_DB=confora \
  pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b
# psql availability / CREATE EXTENSION / cast; docker rm; volume prune
```
