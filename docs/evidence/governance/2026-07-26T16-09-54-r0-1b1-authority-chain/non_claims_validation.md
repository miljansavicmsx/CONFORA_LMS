# Non-claims validation — R0-1B1

Each mandatory non-claim and where it is explicitly stated in the tracked normative corpus.

| Non-claim | Baseline §0 | Owner Decision Register | Owner Decision Package §3 |
|-----------|-------------|-------------------------|---------------------------|
| NestJS intended canonical only | §0.1 | OQ-3 | #1 |
| `apps/api` incomplete / not confirmed buildable | §0.1 | OQ-3 | #1 |
| OQ-3 OPEN | §0.1 | OQ-3 (status OPEN) | #1 |
| FastAPI not approved as canonical | §0.1 | OQ-3 | #2 |
| FastAPI only via frozen-legacy task | §0.1 | OQ-3 | #2 |
| `frontend-app` operational canonical | §0.2 | OQ-4 | #3 |
| ADR-001 contradicted; supersession R0-1B2 | §0.2 | OQ-4, OD-R01-3 | #3 |
| OQ-4 OPEN | §0.2 | OQ-4 (status OPEN) | #3 |
| R0-3 containment only | §0.3 | OQ-6, OD-R03-5 | #4 |
| Production deployment unauthorized | §0.3 | OQ-6, OD-R03-2 | #4 |
| Allowlist temporary deny-all | §0.3 | OD-R03-2 | #4 |
| Admin bypass temporary accepted risk (RA-R03-1) | §0.3 | OD-R03-1 | #4 |
| Tenant/audit partially verified (OQ-7) | §0.4 | OQ-7 | #5 |
| R0-7 required for CI | §0.5 | OD-R03-4 | #6 |
| `.cursor/rules/**` → R0-2 (OQ-2) | §0.6 | OQ-2 | #7 |
| Mapping is not conformity | (Standards Reference Policy §3) | — | #8 |
| Requirement ≠ implementation | §0 preamble | — | (Standards Reference Policy §3) |

## OQ visibility check

OQ-3, OQ-4, OQ-6, and OQ-7 are explicitly visible in the Baseline §0 addendum and in the Owner Decision Register Part A. R0-3 is described as containment only; production deployment is stated as unauthorized.

## Corrective follow-up (F-M1)

The Baseline body was strengthened so intent cannot be misread as verified state:
- §4.1 (frontend) labelled intended-target with a pointer to §0.2 and the `frontend-app` operational-canonical / OQ-4 OPEN statement inline.
- §4.2 (backend) labelled intended-target with a pointer to §0.1 and the `apps/api` incomplete / not-confirmed-buildable / OQ-3 OPEN statement inline.
- §2 marked superseded by `GOVERNANCE_HIERARCHY.md`; owner decisions ranked above the Baseline.

OQ-3 and OQ-4 remain **OPEN**; no backend/frontend was selected or approved.

**Result: PASS — all mandatory non-claims are explicit, now reinforced in the Baseline body (not only §0); no implementation is claimed merely because a requirement exists.**
