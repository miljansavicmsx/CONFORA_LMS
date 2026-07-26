# Contradictions register — R0-1A

These contradictions are **preserved**, not resolved, by this inventory. Promotion must not silently omit them.

## C-01 — Authority chain break

| Side A | Side B |
|--------|--------|
| Tracked `AGENTS.md` declares Baseline highest authority | Baseline file is **untracked** |

**Impact:** Fresh clones cannot obtain the cited controlling document.  
**Resolution path:** OQ-1 Wave A promotion (R0-1B).  
**Must not:** Leave AGENTS.md pointing at a permanently untracked path.

## C-02 / OQ-3 — Backend canonicality vs repository facts

| Side A | Side B |
|--------|--------|
| Baseline / ADR-002 / Component Registry: NestJS `apps/api` canonical; FastAPI `backend/` frozen/legacy | Tracked Nest surface incomplete/not buildable as a recovered SoR; FastAPI `backend/` is large **untracked** tree with significant runtime logic |

**Preserved decision:** NestJS remains **intended** canonical backend; recovery or controlled reconstruction required; FastAPI tracked later as **frozen legacy only** after an approved task.  
**Must not:** Write or promote text claiming Nest is currently complete/buildable; must not redirect deploy to FastAPI as canonical; must not treat R0-3 as OQ-3 closure.

## C-03 — Messaging drift

| Side A | Side B |
|--------|--------|
| Baseline / operational notes: RabbitMQ MVP | ADR-002: Apache Kafka |

**Documented in:** `ADR_ALIGNMENT_NOTE.md`.  
**Resolution path:** Future ADR amendment (out of R0-1A scope).

## C-04 / OQ-5 — Identity and SoD end-state vs transitional runtime

| Side A | Side B |
|--------|--------|
| Canonical end-state: Nest + Keycloak-class identity, RBAC/SoD in canonical stack | Transitional FastAPI/local identity surfaces still present untracked |

**Preserved decision:** End-state remains canonical stack with a **controlled transitional parity gate**.  
**Must not:** Claim full SoD enforcement solely from untracked FastAPI, or claim Nest enforcement complete without evidence.

## C-05 / OQ-4 — Frontend canonicality (must not be omitted)

| Side A | Side B |
|--------|--------|
| ADR-001 **Accepted**: Next.js `apps/web` primary; `frontend-app` / `frontend-public` **frozen** | `FRONTEND_CANONICALIZATION_GAP_NOTE.md`: `frontend-app` is **operational truth** / active pilot UI; Baseline §4.1 drift |

**Preserved decision:** `frontend-app` is current **operational** canonical frontend pending a formal ADR superseding ADR-001.  
**Must not:** Silently alter or omit this contradiction when promoting ADR-001, Baseline, or Component Registry.  
**Promotion rule:** Promote Gap Note **AS_IS**; promote ADR-001 **WITH_REBASELINE** (status note pointing at OQ-4 / pending supersession).

## C-06 / OQ-7 — Tenant isolation and audit

| Side A | Side B |
|--------|--------|
| Multi-tenancy standard + G3/G5 reports claim models and controls | Controls remain **partially verified**; remediation still required |

**Preserved decision:** Separate remediation; do not claim full verification on promotion.  
**Related:** Audit-client vs packages/audit surface fragmentation noted in rebaseline evidence.

## C-07 / OQ-6 — Deploy posture (resolved for auto-deploy; conditions remain)

| Side A | Side B |
|--------|--------|
| Historical unsafe auto-deploy of untracked `backend/` | R0-3 **merged** — containment active with conditions |

**Preserved decision:** OQ-6 satisfied for containment merge; production deploy still unauthorized; deny-all allowlist; RA-R03-1 admin bypass temporary.  
**Must not:** Interpret governance promotion as deployment authorization.

## C-08 — Evidence vs standards tracking posture

| Side A | Side B |
|--------|--------|
| Large `docs/evidence/**` historically tracked | Standards under `docs/governance` / `docs/architecture` untracked |

**Resolution path:** OQ-1. R0-3 evidence already tracked; rebaseline + owner-decision packages still untracked and should be tracked as evidence (not as Baseline).

## Register maintenance

New contradictions discovered during R0-1B must be appended here or in a dated follow-on evidence package — not silently edited out of promoted sources.
