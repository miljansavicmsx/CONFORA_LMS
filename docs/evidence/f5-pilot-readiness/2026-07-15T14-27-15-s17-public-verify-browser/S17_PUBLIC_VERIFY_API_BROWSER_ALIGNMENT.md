# S17 API ↔ Browser Alignment

| Aspect | API | Browser |
|--------|-----|---------|
| Valid hash | `cedf36de04cb8d9866451349199e9861a4641c31bb48ea78c65cdf1eae6a7945` | Playwright navigates `/verify/{hash}` |
| Invalid hash | `0000000000000000000000000000000000000000000000000000000000000000` | Playwright `/verify/not-a-valid-hash` + zero hash via API |
| Status visible | `VALID` | `verify-status-label` test id |
| Certificate number | `CON-2026-000015` | result panel |
| Holder label | `Pilot Learner2` | public label only |
| Scheme | `Sample certification scheme` | scheme fields |

Both surfaces return safe NOT_FOUND for invalid references without internal enum leakage or stack traces.
