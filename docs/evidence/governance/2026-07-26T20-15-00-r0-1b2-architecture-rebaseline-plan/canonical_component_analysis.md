# Canonical component registry analysis

**Source candidate:** docs/architecture/CANONICAL_COMPONENT_REGISTRY.md (untracked)  
**Classification recommendation:** PROMOTE_WITH_REBASELINE

## Required distinction model (recommended legend)

| Class | Meaning | Example from repository |
|-------|---------|-------------------------|
| Intended canonical | Approved target direction | NestJS pps/api, Next.js pps/web/pps/admin |
| Operational canonical | Currently authoritative for pilot/ops | rontend-app (OQ-4) |
| Incomplete canonical | Intended path present but not complete/buildable | Tracked pps/api |
| Transitional | Dual-stack / migration in progress | Nest verify aliases (if/when tracked) |
| Frozen legacy | No new features; retire after gates | FastAPI ackend/ (local; not approved tracked) |
| Generated | Build outputs | dist/, coverage |
| Deprecated | Scheduled removal with evidence | Cognito/DynamoDB paths (mostly untracked infra) |
| Unverified local-only | Exists on disk, not on clean clone | pps/web, pps/admin, most Nest modules |

## Findings

1. **Over-classification as Canonical:** Registry marks pps/api, pps/web, pps/admin as Canonical without separating intended vs operational vs incomplete. **Conflicts with OQ-3/OQ-4 and Baseline §0.**
2. **frontend-app as Transitional only:** Undervalues OQ-4 "operational canonical" status; Gap Note forbids treating it as already deprecated for pilot.
3. **Module table assumes full Nest tree:** Lists dozens of pps/api/src/* modules as Canonical; tracked tree lacks them.
4. **Messaging:** RabbitMQ as Canonical MVP aligns Baseline; Kafka Transitional OK if not implied deployed.
5. **Directory ≠ operational:** Explicit rule for R0-1B2 rebaseline.

## Required transformation before promotion

- Replace binary Canonical/Transitional/Legacy/Unknown with the expanded legend above.
- Add columns: 	racked_status, uildable_clean_clone, evidence_ref.
- Demote apps/web|admin to intended/unverified-local.
- Mark apps/api incomplete canonical + OQ-3 OPEN.
- Mark frontend-app operational canonical (pilot) + intended migration to Next.
- Mark backend frozen-legacy **untracked** (tracking requires separate owner task).
