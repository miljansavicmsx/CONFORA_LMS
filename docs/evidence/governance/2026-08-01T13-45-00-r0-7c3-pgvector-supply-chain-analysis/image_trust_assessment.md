# Image trust assessment

| Topic | Assessment |
|-------|------------|
| Official Images library? | No — Hub namespace `pgvector/pgvector`, not `library/postgres` |
| Upstream relationship | Same org/project as https://github.com/pgvector/pgvector |
| Publisher | Project Docker Hub account; not independently notarized here |
| Release process | Public Dockerfile / buildx multi-arch publish (upstream docs) |
| Vulnerability disclosure | Rely on upstream GitHub + base Postgres image advisories — not CONFORA-owned |
| Update cadence | Active; versioned tags (e.g. `0.8.6-pg16`) coexist with floating `pg16` |
| Trust without signatures | **Insufficient for closure** — digest pin is minimum maturity step |
| Digest pin sufficient now? | **Yes as interim governance control** for CI reproducibility |
| Later signed-image policy | **Required later** (cosign/notation + policy) — deferred beyond R0-7C4 unless owner advances |

Do **not** claim the image is “trusted” solely because it is public or widely used.
