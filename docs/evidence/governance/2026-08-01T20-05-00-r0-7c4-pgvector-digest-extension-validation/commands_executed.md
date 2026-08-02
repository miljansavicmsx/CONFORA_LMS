# Commands executed

```text
git fetch origin
# stale branch safety: unique_count=0; delete local-only; recreate from ec5a77809f21d09cf60247f0c71c424cb0ddeae5
git switch governance/r0-7c3-pgvector-supply-chain-analysis
git merge --ff-only origin/governance/r0-7c3-pgvector-supply-chain-analysis
git branch -D ci/r0-7c4-pgvector-digest-extension-validation
git switch -c ci/r0-7c4-pgvector-digest-extension-validation ec5a77809f21d09cf60247f0c71c424cb0ddeae5
docker buildx imagetools inspect pgvector/pgvector:pg16
# ephemeral version pre-check + local validation (0.8.6)
# edit ci.yml + accessibility.yml
git commit -m "ci: pin pgvector image and verify extension"
# evidence folder + second commit
```


## Independent review closure

```text
git fetch origin
# verify head 47657f97…, blobs identical to aeb7578c, no PR
# create/update evidence files under this folder only
git commit -m "docs(repo): record r0-7c4 independent review"
git push origin ci/r0-7c4-pgvector-digest-extension-validation
```
