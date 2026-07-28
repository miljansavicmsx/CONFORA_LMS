# Governance inputs applied

- `AGENTS.md`
- Tracked `docs/governance/**` (authority chain active via R0-1B1)
- Seven tracked architecture SoT files (R0-1B2.1)
- R0-3 deploy containment evidence / `deploy-backend.yml` fail-closed design
- R0-1B2.1 independent review: CI failures classified as R0-7 repository condition

Architecture constraints binding this plan:

- `frontend-app` = OPERATIONAL_CANONICAL / OPERATIONAL_BRIDGE
- `apps/api` = INTENDED_CANONICAL_INCOMPLETE / CANONICAL_TARGET (OQ-3 OPEN)
- `apps/web` / `apps/admin` = UNVERIFIED_LOCAL_ONLY (OQ-4 OPEN)
- `backend/` = FROZEN_LEGACY / LEGACY_TO_RETIRE (no FastAPI track via CI)
- Production unauthorized (OQ-6 / R0-3)
