# Route Inventory

FINAL_PRODUCTION_ROUTE_COUNT=5
P08_PRODUCTION_ROUTE_COUNT=2
P08_ROUTE_DELTA=+2

Exact final production routes:

1. GET /v1/health
2. GET /v1/me/certification/applications
3. GET /v1/me/certification/applications/:id
4. GET /v1/staff/reports/certification-applications/by-status
5. GET /v1/staff/reports/certification-applications/by-scheme-ref

Forbidden (absent): route aliases; generic /:dimension; row endpoint; export endpoint; audit-report endpoint.

Verified by: P08 e2e P08_TEST_005/006; AUTH_30; P07_TEST_088 adaptation.
