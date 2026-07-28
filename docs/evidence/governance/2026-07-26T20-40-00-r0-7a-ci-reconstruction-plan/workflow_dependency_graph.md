# Workflow dependency graph

```text
pnpm-lock.yaml + package.json + workspace packages
        |
        +-- CI.quality (install) ----X RC-R07-1 outdated lockfile
        |         |
        |         +-- lint/typecheck/test/build (never reached)
        |
        +-- CI.database
        |         |
        |         +-- service pgvector ----X RC-R07-3 exit 125
        |         +-- (would need) packages/database ----X RC-R07-2 untracked
        |         +-- (would need) install ----X RC-R07-1
        |
        +-- CI.docker needs [quality, database] ---- SKIPPED (RC-R07-6)
                  +-- Dockerfiles ----X RC-R07-7 untracked

Accessibility.compliance-iso
        +-- same pgvector service ----X RC-R07-3
        +-- packages/database / apps/web / Nest build assumptions

Accessibility.accessibility
        +-- install ----X RC-R07-1
        +-- scripts/a11y/*.mjs ----X RC-R07-4 untracked
        +-- docker-compose.a11y-ci + backend FastAPI ---- LEGACY (RC-R07-5)
        +-- apps/web|admin untracked ---- OQ-4

deploy-backend.yml (isolated)
        +-- R0-3 fail-closed on untracked backend (intentional)
```
