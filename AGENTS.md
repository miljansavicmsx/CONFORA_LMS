# CONFORA AI Agent Instructions

# Canonical Authority

Approved owner decisions are the highest repository governance authority.

The Canonical Development Baseline is the controlling development baseline,
subordinate to approved owner decisions and interpreted according to
`docs/governance/GOVERNANCE_HIERARCHY.md`:

**docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md**

All AI agents SHALL:

- Read and follow the Baseline before implementation
- Treat the Baseline as the controlling development baseline, subordinate only
  to approved owner decisions, per `docs/governance/GOVERNANCE_HIERARCHY.md`
- Report specification conflicts
- Refuse implementations that violate governance requirements

Mandatory compliance:

- ISO/IEC 17024
- ISO 21001
- ISO/IEC 27001
- GDPR
- AI Governance
- Segregation of Duties
- Multi-Tenant Isolation
- Immutable Audit Trail
- Evidence Preservation

When conflicts are detected:
**STOP implementation and report them.**

---

You are working on CONFORA:

Digital Competence & Certification Infrastructure Platform.

The system combines:

- learning,
- assessment,
- certification,
- standards intelligence,
- AI governance,
- conformity assessment,
- digital trust.

# Primary Standards

- ISO/IEC 17024
- ISO 21001
- ISO/IEC 19788
- ISO/IEC 8808
- ISO/IEC 27001
- WCAG 2.2

# Architecture Principles

- Domain-driven design
- Enterprise modularity
- Separation of duties
- Immutable auditability
- AI transparency
- Human oversight

# Mandatory Requirements

Always preserve:

- auditability,
- traceability,
- security,
- multilingual support,
- accessibility,
- tenant isolation.

# Never

Never generate:

- fake compliance,
- fake audit trails,
- hidden AI decisions,
- uncontrolled admin access,
- architecture-breaking shortcuts.

# AI Usage

AI is assistive only.

Certification decisions require human review.

All AI-generated outputs must support:

- audit logs,
- reviewer approval,
- traceability,
- disclosure.

# Code Quality

Generate:

- explicit types,
- clean architecture,
- reusable modules,
- testable services,
- secure APIs,
- production-ready code.

Avoid:

- spaghetti code,
- temporary hacks,
- duplicate logic,
- unclear naming.

# Cursor Cloud specific instructions

This revision's runnable product is the Nest API in `apps/api` with PostgreSQL 16. `backend/`, `frontend-public/`, and `infra/docker/` are not in this tree, so root `docker-compose.yml` cannot start the legacy stack.

- Install with `pnpm install --frozen-lockfile` (`packageManager` is `pnpm@9.14.2`). Set `PUPPETEER_SKIP_DOWNLOAD=1` and `DISABLE_ERD=true` for install and `pnpm build`.
- The API connects to Postgres during boot and exits unless `DATABASE_URL`, `OIDC_ISSUER_URL`, and `OIDC_CLIENT_ID` are set. Use port 5432 on this host (`.env.example` uses 15432 for a Windows port clash):
  - `DATABASE_URL=postgresql://confora:confora_dev_change_me@127.0.0.1:5432/confora`
  - `OIDC_ISSUER_URL=http://localhost:18080/realms/confora`
  - `OIDC_CLIENT_ID=confora-web`
- Keycloak does not need to be running for `GET /v1/health`. Protected routes such as `GET /v1/me/certification/applications` return 401 without a bearer token.
- PostgreSQL 16 comes from Ubuntu packages. Systemd is blocked here; start the cluster with `sudo pg_ctlcluster 16 main start`, create role and database `confora`, then run `pnpm --filter @confora/database exec prisma migrate deploy`.
- Migration-proof tests and `apps/api/src/auth/resolve-db-user.spec.ts` run Docker against the digest-pinned `pgvector/pgvector:pg16` image. The daemon needs the `fuse-overlayfs` storage driver and iptables-legacy. The `ubuntu` user must be in the `docker` group; a shell started before that membership change still needs a new login.
- `pnpm typecheck`, `pnpm build`, `pnpm --filter @confora/api test`, and `pnpm --filter @confora/database test` are the checks for this tree. `pnpm lint` fails on a pre-existing `@typescript-eslint/no-unnecessary-type-conversion` error in `packages/ai-prompts/src/index.ts`.
