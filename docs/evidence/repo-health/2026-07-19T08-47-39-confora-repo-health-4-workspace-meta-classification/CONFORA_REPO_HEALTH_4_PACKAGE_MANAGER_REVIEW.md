# Package manager review

| Signal | Value |
|--------|-------|
| `package.json#packageManager` | `pnpm@9.14.2` |
| Engines | {"node":">=20.10.0","pnpm":">=9.14.2"} |
| `pnpm-workspace.yaml` | exists, 43 bytes |
| `pnpm-lock.yaml` | exists, 517269 bytes |
| `package-lock.json` | exists, 90 bytes — **empty packages map** |

## Recommendation

**Use pnpm only** (not mixed mode).

| File | Action |
|------|--------|
| `pnpm-workspace.yaml` | Track |
| `pnpm-lock.yaml` | Track |
| `package-lock.json` | **Do not track**; treat as accidental npm stub; prefer delete in a later approved cleanup (not executed here) |

Scripts/hooks already assume pnpm (`prepare: husky`, husky pre-commit `pnpm …`, turbo scripts).
