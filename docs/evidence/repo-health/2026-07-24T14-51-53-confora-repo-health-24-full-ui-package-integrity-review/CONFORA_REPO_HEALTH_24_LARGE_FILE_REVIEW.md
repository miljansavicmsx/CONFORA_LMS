# CONFORA-REPO-HEALTH-24 — Large File Review

| Path | Bytes | Class |
|------|-------|-------|
| `tokens.ts` | 6078 | largest source; design data |
| `ai-disclosure.tsx` | 2360 | source |
| others | ≤1331 | source / config |

## Artifacts

| Check | Result |
|-------|--------|
| Large binaries | **none** |
| Bundles / `.map` / compiled JS under package | **none tracked** |
| `dist/` present/tracked | **no** |
| Vendored deps under `packages/ui` | **no** |
| Generated artifacts | **no** |

`postcss.config.cjs` is a small source config (87 B), not a compiled app bundle.

**`large_binary_committed`:** false  
**`compiled_artifacts_present`:** false
