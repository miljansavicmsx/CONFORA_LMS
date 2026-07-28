# Lockfile diff analysis

| Metric | Before | After |
|--------|--------|-------|
| Importers | 17 | 12 |
| Lines (approx) | larger | −2572 / +81 net on operational commit |

Removed stale importers for untracked apps and `packages/database`.

Root direct `jsqr` and `pngjs` entries removed.

Resolution normalization for remaining tracked workspace packages occurred as part of regeneration (pnpm 9.14.2 lockfile v9).
