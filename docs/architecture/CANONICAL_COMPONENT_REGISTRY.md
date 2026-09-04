# CONFORA Canonical Component Registry

| Field | Value |
|-------|-------|
| **Document ID** | CON-ARCH-REGISTRY-001 |
| **Status** | Normative architecture (R0-1B2.1) |
| **Date** | 2026-07-26 |
| **Authority** | Subordinate to owner decisions and Baseline |
| **Companion** | [ARCHITECTURE.md](./ARCHITECTURE.md), [LEGACY_DEPRECATION_MATRIX.md](./LEGACY_DEPRECATION_MATRIX.md) |

## Status model (two dimensions)

### Current evidence status

| Status | Meaning |
|--------|---------|
| `OPERATIONAL_CANONICAL` | Authoritative in current pilot/ops; tracked + evidenced |
| `INTENDED_CANONICAL_INCOMPLETE` | Approved target path present but incomplete / not confirmed buildable |
| `TRANSITIONAL` | Dual-stack or migration bridge |
| `FROZEN_LEGACY` | No new features; retire after gates |
| `DEPRECATED` | Removal scheduled |
| `GENERATED` | Build artifact; not source SoT |
| `UNVERIFIED_LOCAL_ONLY` | On disk / local; not clean-clone SoT |
| `PLANNED` | Named future component |
| `RETIRED` | Removed/archived |

### Intended architectural role

| Role | Meaning |
|------|---------|
| `CANONICAL_TARGET` | Intended long-term canonical surface |
| `OPERATIONAL_BRIDGE` | Current bridge pending cutover |
| `LEGACY_TO_RETIRE` | To be retired after evidence gates |
| `GENERATED_ARTIFACT` | Generated output |
| `PLANNED_COMPONENT` | Future |
| `NO_APPROVED_ROLE` | No approved architectural role yet |

**Rule:** Directory existence alone never implies `OPERATIONAL_CANONICAL`.

### Change / approval policy (summary)

| Current status | Allowed changes | Required approval | Evidence | Exit |
|----------------|-----------------|-------------------|----------|------|
| `OPERATIONAL_CANONICAL` | Pilot maintenance; no strategic expansion without exception | Owner / Architecture Board | Tracked + reproducible | Superseding ADR / cutover evidence |
| `INTENDED_CANONICAL_INCOMPLETE` | Controlled reconstruction under OQ task | Owner for recovery OD | Gap list on clean clone | Buildable clean-clone + review |
| `FROZEN_LEGACY` | Freeze only; track only via separate OD | Owner to track | Inventory | Strangler + sign-off |
| `UNVERIFIED_LOCAL_ONLY` | Do not rely in CI/docs claims | Owner to promote | `git ls-files` | Controlled promotion |
| `GENERATED` | Never hand-edit | N/A | gitignore | Regenerate |

---

## Seed registry

| Component | Path | Tracked files | Current evidence status | Intended role | Buildability / operational evidence | Allowed changes | Required approval | Owner | Dependencies | Exit condition | Supporting evidence | Contradiction IDs |
|-----------|------|---------------|-------------------------|---------------|-------------------------------------|-----------------|-------------------|-------|--------------|----------------|---------------------|-------------------|
| Frontend (Vite pilot) | `frontend-app/` | 108 | `OPERATIONAL_CANONICAL` | `OPERATIONAL_BRIDGE` | Vite scripts tracked; Gap Note operational claim | Pilot maintenance only | Architecture Board exception for feature growth | Frontend | Nest/API when available | Gap Note exit criteria + future ADR-008 | Gap Note; Baseline §0.2 | C-05 / OQ-4 |
| Nest API | `apps/api/` | ~110 | `CANONICAL_BACKEND_CONFIRMED` | `CANONICAL_TARGET` | Historical incomplete/not-buildable state superseded by accepted BAR-P01..P08 + OQ-3 CLOSED_ACCEPTED; clean-clone build confirmed (CR1) | New backend features under Nest authority | Architecture Board / owner for scope expansions | Backend | packages/*, Prisma | OQ-3 closed | BAR-P01..P08; OQ-3 CR1/FC evidence | C-02 / OQ-3 CLOSED |
| Next learner web | `apps/web/` | 0 | `UNVERIFIED_LOCAL_ONLY` | `CANONICAL_TARGET` | Local scaffold only; no clean-clone SoT | Do not claim operational | Owner promotion | Frontend | frontend-app parity | Tracked promotion + E2E | `git ls-files` = 0 | C-05 / OQ-4 |
| Next admin | `apps/admin/` | 0 | `UNVERIFIED_LOCAL_ONLY` | `CANONICAL_TARGET` | Local scaffold only | Do not claim operational | Owner promotion | Frontend | frontend-app parity | Tracked promotion + E2E | `git ls-files` = 0 | C-05 / OQ-4 |
| Worker | `apps/worker/` | 0 | `UNVERIFIED_LOCAL_ONLY` | `CANONICAL_TARGET` | Untracked Nest worker stub possible locally | No messaging SoT claim | Owner + messaging OD (C-03) | Backend | broker decision | Tracked + verified consumer | tracked=0 | C-03 |
| FastAPI monolith | `backend/` | 0 | `FROZEN_LEGACY` | `LEGACY_TO_RETIRE` | Local untracked; not canonical | Freeze; **no track via this doc** | Separate frozen-legacy OD | Backend | Nest parity | Strangler evidence + OD | local routers may exist | C-02 / OQ-3 |
| Shared kernel | `packages/shared-kernel/` | 9 | `INTENDED_CANONICAL_INCOMPLETE` | `CANONICAL_TARGET` | Partial tracked src | Kernel-only changes | Architecture Board | Platform | consumers | Complete contracts + tests | tracked src | C-09 |
| Shared types | `packages/shared-types/` | 8 | `INTENDED_CANONICAL_INCOMPLETE` | `CANONICAL_TARGET` | Partial | Contract changes with review | Architecture Board | Platform | API/UI | Stable versioning | tracked | — |
| UI package | `packages/ui/` | 11 | `INTENDED_CANONICAL_INCOMPLETE` | `CANONICAL_TARGET` | Partial | Design-system only | Frontend | Frontend | apps | Accessibility evidence | tracked | — |
| i18n | `packages/i18n/` | 50 | `INTENDED_CANONICAL_INCOMPLETE` | `CANONICAL_TARGET` | Partial locales | Translation keys only | Frontend | Frontend | apps | Coverage sign-off | tracked | — |
| Audit client | `packages/audit-client/` | 5 | `TRANSITIONAL` | `OPERATIONAL_BRIDGE` | Client only; ledger service incomplete on clean clone | No SoR claims | Architecture Board | Platform | audit API | Consolidate to audit package when tracked | tracked | C-06 / OQ-7 |
| Database package | `packages/database/` | ~16 | `CANONICAL_DATA_AUTHORITY` | `CANONICAL_TARGET` | Historical clean-clone absence superseded by BAR-P02 PostgreSQL/Prisma authority | Schema/migration only under authorized BAR/OD | Owner / Architecture Board | Data | migrations | Tracked Prisma project present | BAR-P02; Baseline §4.3 | C-06 / OQ-7 (audit completeness may remain open) |
| Auth package | `packages/auth/` | 0 | `UNVERIFIED_LOCAL_ONLY` | `CANONICAL_TARGET` | Absent on clean clone | No complete RBAC claim | Owner | Security | OQ-5 | Tracked contracts | tracked=0 | C-04 / OQ-5 |
| Audit package | `packages/audit/` | 0 | `UNVERIFIED_LOCAL_ONLY` | `CANONICAL_TARGET` | Absent on clean clone | No complete ledger claim | Owner | Platform | OQ-7 | Tracked ledger helpers | tracked=0 | C-06 / OQ-7 |
| Generated dist | `**/dist/` | N/A (ignored) | `GENERATED` | `GENERATED_ARTIFACT` | Prior build residue only | Never hand-edit | N/A | Eng | CI | Regenerate from source | gitignore | — |

---

## Explicit non-claims

- This registry does not close OQ-3, OQ-4, OQ-5, or OQ-7.
- This registry does not authorize FastAPI tracking.
- This registry does not activate Kafka or RabbitMQ as verified deployed MVP.
- G3–G6 reports and Architecture Bible remain non-normative.
