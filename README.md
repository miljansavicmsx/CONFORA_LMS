# CONFORA

Digital Competence & Certification Infrastructure Platform.

CONFORA combines learning, assessment, certification, standards intelligence, AI-assisted workflows, compliance, and digital trust in an enterprise-grade, multi-tenant architecture aligned with ISO/IEC 17024, ISO 21001, ISO/IEC 27001, and GDPR.

## Governance

The authoritative development document for CONFORA is:

**[docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md](docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md)**

This document is the single source of truth for:

- Architecture decisions
- Security requirements
- ISO compliance
- GDPR requirements
- AI governance
- Roles and permissions
- Segregation of duties
- Multi-tenancy
- Auditability requirements

If any document conflicts with the Baseline, the Baseline prevails.

See also:

- [docs/governance/GOVERNANCE_HIERARCHY.md](docs/governance/GOVERNANCE_HIERARCHY.md) — document precedence levels
- [AGENTS.md](AGENTS.md) — AI agent instructions
- [.cursor/rules/confora-baseline.mdc](.cursor/rules/confora-baseline.mdc) — Cursor rule (always applied)

## Repository layout (summary)

| Path | Purpose |
|------|---------|
| `apps/api` | NestJS canonical API |
| `apps/worker` | Background processing |
| `packages/database` | Prisma schema and migrations |
| `infra/docker` | Local staging infrastructure (PostgreSQL, Keycloak, Redis, …) |
| `docs/governance` | Canonical baseline and governance index |
| `docs/implementation` | Implementation and validation reports |
| `scripts/ops` | Staging pilot, soak, and operational scripts |

## Local staging pilot

See `docs/implementation/P0_LOCAL_STAGING_INFRA_STABILIZATION_REPORT.md` and `scripts/ops/start-staging-pilot.ps1`.
