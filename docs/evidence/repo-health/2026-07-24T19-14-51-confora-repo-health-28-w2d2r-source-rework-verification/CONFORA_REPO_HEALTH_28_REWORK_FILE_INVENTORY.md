# CONFORA-REPO-HEALTH-28 — Rework File Inventory

**Count:** 8 · all **untracked** · timestamp `2026-07-24T19:14:51`

| Path | Bytes | SHA-256 | Imports | Exports | Role |
|------|-------|---------|---------|---------|------|
| `src/escape.ts` | 885 | `fd24c859a3730e10fe7eb079ffaa90956a55f1b71123b0c20b47655751bf4a2b` | none | `escapeHtmlText`, `sanitizePlainTextSubject` | Pure escape helpers |
| `src/subjects.ts` | 5960 | `a67a2ba323989d3f31d612facbdc3030a842e8a5974e18586fe7331973b5bb76` | `./event-keys` (type), `./escape` | locales, `resolveNotificationSubject`, types | Subject catalog + fallback |
| `src/events.ts` | 6425 | `e55912ed312862b45a6e1abae5bbd441d398655cea663fd89a9ac7d405d424d4` | `node:path`, `./event-keys`, `./escape`, `./subjects` | interpolate APIs, `loadBundledEmailTemplate`, re-exports | Safe interpolate + lazy Node loader |
| `src/index.ts` | 647 | `c0400720754523a7e0ea31e3a84b14ef705838b1d2a671c396c9491f9f9f055a` | `./event-keys`, `./escape`, `./subjects` | keys + escape + subjects only | Safe barrel |
| `src/escape.test.ts` | 789 | `24823cb3cfe09531542392a2f4eec0128deaec2ddcceaa0e8db9c0203e9f87f0` | `./escape` | n/a | Tests |
| `src/subjects.test.ts` | 2296 | `ff24052c198e9096a1dfbca011470adb482583944db0c3e08aa83c282315e0d5` | `./subjects` | n/a | Tests |
| `src/events.interpolate.test.ts` | 1980 | `ca964ecca54d4a0c54a2860270cf76f1106b72cfda61fd76e34b83b31c62c09b` | `./events` | n/a | Tests |
| `src/index.test.ts` | 1261 | `8d045c5c8d6de16bda2def1abde0d42b691f3d9b35da8b52490d5f26a53b9f7c` | `./index` | n/a | Tests |
