# 13 EV3 Supersession Map

R3_EVIDENCE_DEFECT_COUNT = 5

EV3-01 unsupported Dashboard runtime closure claims
-> R3 REJECT -> FIXED by real Vitest runtime + Playwright mount of DashboardLayout at 86aca155e4f3924617c290bb4771bd188dbefa73
-> proof: dashboard-layout.runtime.test.ts + csp-preview-enforce-smoke.spec.ts

EV3-02 stale "evidence commit pending" in R2R1 01_AUTHORITY_AND_LINEAGE.md
-> R3 REJECT; remained at 06bb55b6bd5424f16a86ead9af41abaa87d301e5
-> SUPERSEDED: that string is a stale rejected historical placeholder; historical package head for R2R1 evidence is e8cd567167c29466544361d0e5ba361b68b96331; this package records actual source SHA 86aca155e4f3924617c290bb4771bd188dbefa73 Evidence SHA is the docs(evidence) commit parented on that source SHA (recorded in external logs after commit; no impossible self-SHA embedded in the tree)

EV3-03 inaccurate wrong-directory index.html full-build supporting log
-> R3 REJECT -> SUPERSEDED by correct-directory `cd frontend-app && npx vite build` baseline-red evidence

EV3-04 Dashboard PASS claims based only on source inspection/static tests
-> R3 REJECT -> SUPERSEDED by real component runtime test (csp-compat remains supplemental static only)

EV3-05 contradictory evidence-quality zero claims while defects present
-> R3 REJECT; R4 confirmed remaining/new evidence defects on 06bb55b6bd5424f16a86ead9af41abaa87d301e5
-> SUPERSEDED: historical zero claims were invalid; new package quality metrics are fresh actual measurements only

R3_EVIDENCE_DEFECTS_EXPLICITLY_SUPERSEDED_COUNT = 5
STALE_PLACEHOLDER_EXPLICITLY_SUPERSEDED = true
