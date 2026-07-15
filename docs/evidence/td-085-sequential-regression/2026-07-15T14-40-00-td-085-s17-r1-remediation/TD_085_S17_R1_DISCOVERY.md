# TD-085-S17-R1 Discovery

**Prior TD-085:** `docs/evidence/td-085-sequential-regression/2026-07-15T13-32-47-td-085/`  
**Prior verdict:** `TD_085_NO_GO_RBAC_PRIVACY_OR_GOVERNANCE_REGRESSION`

## Failing command that drove privacy/governance NO-GO

| Command | Status | Child verdict |
|---------|--------|---------------|
| `ops:s17-public-verify-browser` | FAIL | `S17_PUBLIC_VERIFY_BROWSER_NO_GO_PRIVACY_OR_GOVERNANCE_REGRESSION` |
| S17 evidence | — | `docs/evidence/f5-pilot-readiness/2026-07-15T13-32-55-s17-public-verify-browser/` |

Also failed (non-privacy drivers for TD-085 mapping): f5-3, admin-gov, learner, f4-9. TD-085 privacy NO-GO mapping keyed off S17 child verdict via `/privacy.*regression/i`.

## Observed S17 symptoms (2026-07-15T13-32-55)

| Check | Result |
|-------|--------|
| API valid/invalid public verify | PASS (no private field hits) |
| Individual PII flags (email/jmbg/etc.) | all false |
| `public_route_no_auth_status` | FAIL |
| `pii_minimization_status` | FAIL |
| Playwright / screenshots | FAIL |
| Frontend on :3001 | UP but wrong app |

## Stack notes

S17/Playwright expect **`frontend-app` (Vite)** on `:3001` with `/verify`. A-02-R2 TD-085 ran with **`@confora/admin` (Next)** on `:3001`, so `/verify` 404'd and browser privacy/read-only checks failed despite clean API PII scans.
