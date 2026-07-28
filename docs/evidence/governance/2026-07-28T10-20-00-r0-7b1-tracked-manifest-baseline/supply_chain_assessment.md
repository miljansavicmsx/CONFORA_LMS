# Supply-chain assessment

| Topic | Assessment |
|-------|------------|
| Package-manager pinning | Root `packageManager: pnpm@9.14.2` present; workflows partially floating |
| Corepack | Available; must be used to enforce 9.14.2 in R0-7B2 |
| Lifecycle scripts | Root `prepare` → `husky` only among tracked manifests |
| Install hooks | Husky prepare can mutate local git hooks — use `--ignore-scripts` for lockfile-only stage |
| Git dependencies | Not observed in tracked root drift analysis as the failure mode |
| Mutable refs | Floating workflow Action tags (`@v4`) and `confora-qa` `version: 9` |
| Workspace protocol | Extensive `workspace:*` usage among tracked packages — expected |
| Registry | Default npm registry assumed; no tracked `.npmrc` |
| Auth/tokens | None required for public registry install analysis; do not embed secrets in evidence |
| Integrity | pnpm lockfile v9 includes version resolutions; regeneration must preserve integrity model |
| Untrusted scripts risk | Medium during full install (husky + transitive); **low** if `--ignore-scripts` used for lockfile-only |

## R0-7B2 initial procedure recommendation

Use:

```text
pnpm install --lockfile-only --ignore-scripts
```

with pnpm `9.14.2` in a clean worktree, **before** a full frozen install that may run lifecycle scripts.

R0-7B1 did **not** execute untrusted lifecycle scripts beyond observing the frozen-install failure (which aborts before install completes).
