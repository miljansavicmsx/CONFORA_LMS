# Dependency drift resolution

| Package | Pre-R0-7B2 | Post-R0-7B2 | Action |
|---------|------------|-------------|--------|
| `jsqr` | Direct root lock-only | Absent | Removed; not added to package.json |
| `pngjs` | Direct root lock-only (`^7.0.0`) | No direct root; transitive `5.0.0` via `qrcode` | Direct removed; transitive retained |

No tracked root workspace package undeclared requirement found for direct `jsqr`/`pngjs`.
