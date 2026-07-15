# TD-085-S17-R1 Targeted Tests

| Check | Result | Evidence / notes |
|-------|--------|------------------|
| `GET /verify` on frontend-app :3001 | PASS (200) | Env preflight |
| `GET /api/public/verify/:hash` valid | PASS | S17 rerun |
| Invalid hash safe NOT_FOUND | PASS | S17 rerun |
| API private-field scan | PASS (0 hits) | S17 privacy check |
| Playwright public-ux-1 | PASS | S17 2026-07-15T14-27-15 |
| S17 screenshots | PASS | 3 files |
| `ops:f5-3-data-readiness` | PASS (50/50) | MFA-aware D-02/D-04/RBAC |
| Nested S17 suite (f4 audit, f5-5, f4-9-smoke-test) | PASS | Inside S17 GO |

No production unit-test file changes were required for this remediation (ops harness only).
