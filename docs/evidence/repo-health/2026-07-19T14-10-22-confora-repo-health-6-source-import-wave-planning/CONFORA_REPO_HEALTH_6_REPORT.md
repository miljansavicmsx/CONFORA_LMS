# CONFORA-REPO-HEALTH-6 — Report

| Field | Value |
|-------|-------|
| Evidence | `docs/evidence/repo-health/2026-07-19T14-10-22-confora-repo-health-6-source-import-wave-planning/` |
| Based on | `6fc1152` |
| Status entries | **1646** |
| Source candidate files (code-path approx) | **~2003** (`apps/api`+`frontend-app`+`packages`+`scripts/ops`+compose/cursorignore) |
| Evidence files deferred | **~102258** |
| Source committed | false |
| Verdict | `CONFORA_REPO_HEALTH_6_AUDIT_ONLY_READY_FOR_REVIEW` |

## Source candidate summary

| Area | Untracked approx |
|------|-----------------:|
| `apps/api` | 833 |
| `frontend-app` | 796 |
| `scripts/ops` | 195 |
| `packages` | 158 |
| Infra stacks | ~76 |
| `docs` non-evidence | ~628 |
| `docs/evidence` | ~102258 (do not bulk) |

## High-risk review list

- `apps/api/src/auth/**` (+ `jwt-hs256-secret.ts`)
- `apps/api/src/security/**`, `tenant/**`, `prisma/**`
- `frontend-app/.env.example`
- Keycloak/MFA ops scripts (`keycloak-mfa-pkce-enrollment.mjs`, `run-ep-tech-8-mfa-training-closure.mjs`)

## Recommended waves

1. W1 — App + compose config manifests (**first**)  
2. W2 — Shared packages  
3. W3 — API core + education  
4. W4 — API auth/security/tenant/prisma (gate)  
5. W5 — API certification (SoD-split commits)  
6. W6 — Frontend shell → domains  
7. W7 — Tests / ops / curated evidence  

## First wave candidate

`W1_APP_AND_COMPOSE_CONFIG_MANIFESTS` (~20 explicit files)

## Final verdict

`CONFORA_REPO_HEALTH_6_AUDIT_ONLY_READY_FOR_REVIEW`
