# CONFORA-REPO-HEALTH-31 — Notification Source Inventory

**Tracked count:** 12 · timestamp `2026-07-24T21:28:45`

| Path | Bytes | SHA-256 | Imports | Exports | Role |
|------|-------|---------|---------|---------|------|
| `package.json` | 654 | `573a1979…` | n/a | package exports map | Manifest (earlier wave) |
| `tsconfig.json` | 283 | `434b1846…` | extends config | n/a | TS config |
| `tsconfig.build.json` | 176 | `db94b695…` | extends local | n/a | Build config |
| `src/event-keys.ts` | 1561 | `4746bab9…` | none | keys, type, guard | Event taxonomy |
| `src/escape.ts` | 885 | `fd24c859…` | none | escape helpers | Pure HTML/subject sanitize |
| `src/subjects.ts` | 5960 | `a67a2ba3…` | event-keys type, escape | resolve subject + meta | Subject catalog |
| `src/index.ts` | 647 | `c0400720…` | event-keys, escape, subjects | safe barrel | Public surface |
| `src/events.ts` | 6425 | `e55912ed…` | path, event-keys, escape, subjects | interpolate + lazy loader | Node renderer helpers |
| `src/escape.test.ts` | 789 | `24823cb3…` | escape | n/a | Tests |
| `src/subjects.test.ts` | 2296 | `ff24052c…` | subjects | n/a | Tests |
| `src/index.test.ts` | 1261 | `8d045c5c…` | index | n/a | Tests |
| `src/events.interpolate.test.ts` | 1980 | `ca964ecc…` | events | n/a | Tests |

## Expected set

9 source/test files + 3 manifests/configs. No unexpected tracked files. No untracked `src/` residue. No MJML tracked.

## Config in latest source imports

`package.json` / lockfile / workspace **not** modified in W2D-2 / W2D2R slice commits (`82b61654`, `1afcb4b0`, `f6338917`).
