# Lockfile importer validation

| Check | Result |
|-------|--------|
| Importer count | 12 |
| Matches expected set | True |
| Stale importers absent | yes |
| `frontend-app` importer absent | yes |
| `packages/database` absent | yes |
| Direct root `jsqr` | absent |
| Direct root `pngjs` | absent |
| Transitive `pngjs@5.0.0` | via `qrcode@1.5.4` (declared by `@confora/api`) — legitimate |
| Lockfile version | 9.0 |
