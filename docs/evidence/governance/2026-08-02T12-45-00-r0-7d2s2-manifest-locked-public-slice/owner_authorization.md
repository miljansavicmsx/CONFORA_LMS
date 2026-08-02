# Owner authorization applied (R0-7D2S2)

## Authorized

- Architecture: `A11Y_PUBLIC_ENTRY_SEPARATION`
- Routes: `/`, `/login`, `/verify`
- Exact promoted-source ceiling: `68` (S1 `closure/files-to-promote.txt`)
- Cumulative operational changed-file ceiling: `78`
- Package strategy: source-resolve + ephemeral CSS (no committed package dist)
- Path-checkout of candidate sources from rejected tip `13cdd752…` (not cherry-pick, not base)

## Prohibited (honored)

- Broad `git add frontend-app/src`
- Generated package CSS / `dist` tracking
- Package-contract rewrites / package-local TS config duplication for contracts
- Production application entry modification (`main.tsx`, `App.tsx`)
- Accessibility remediation
- Axe / browser scanner dependencies
- Accessibility workflow reconstruction
- Opening a pull request
- Using `ci/r0-7d2-accessibility-baseline` as implementation base
- Cherry-picking rejected commits
