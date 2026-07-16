# Boundary checks

| Boundary | Result |
|----------|--------|
| žalba ≠ prigovor | PASS (separate tabs, DTOs, APIs) |
| contact ≠ appeal/complaint | PASS (support page separate) |
| Submit does not change certification status | PASS (asserted in boundary e2e / service design) |
| Submit does not change exam result | PASS |
| Submit does not issue/lifecycle certificate | PASS |
| No raw enums in learner labels | PASS (unit labels) |
