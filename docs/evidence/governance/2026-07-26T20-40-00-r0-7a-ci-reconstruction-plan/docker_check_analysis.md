# Docker check analysis (RC-R07-6, RC-R07-7)

Job: `docker` in `ci.yml`.

## Why skipped on PR #3

```yaml
needs: [quality, database]
```

Both dependencies failed → job **SKIPPED**. This is expected GitHub Actions
behavior, not an intentional success.

## What it would do

Build (no push) images using:

- `infra/docker/Dockerfile.api`
- `infra/docker/Dockerfile.web`
- `infra/docker/Dockerfile.admin`

All three Dockerfiles: **untracked** (local exists). Even if `needs` were
removed, clean-clone builds would fail missing files.

## Assessment

Skipping is a **symptom** of upstream failures plus stale assumptions about
Next Dockerfiles for untracked apps. Unsafe to treat SKIPPED as pass.
Reconstruction: recover quality/database first; track or rewrite Dockerfiles
aligned to SoT (likely API + frontend-app, not untracked admin/web) under a
later task.
