# CONFORA-REPO-HEALTH-19 — UI closed manifest

`ui_manifest_closed: true` — exactly these **6** paths; no others under scope.

| Path | Bytes | SHA-256 | Artifact type | Why UI-related | Direct imports | Exports | Preliminary class |
|------|------:|---------|---------------|----------------|----------------|---------|-------------------|
| `packages/ui/tokens.ts` | 6078 | `73cf8c5d95dda904a59dd3b594b9b7f3f1fd1f0da8db2632351421fd93f08bed` | design_tokens_ts | Canonical design-system color tokens | _(none)_ | `ColorTokenRole`, `ColorTokenDef`, `colorTokens`, `ColorTokenId`, `foregroundTokenIds`, `backgroundTokenIds`, `TextCategory`, `documentedPairs` | IMPORT_CANDIDATE |
| `packages/ui/src/ai-disclosure.tsx` | 1238 | `7dda3a96d72fd138d84fe7669ec51bb6f91a84126684383110e45b53e30379b0` | react_tsx_component | AI-assisted disclosure UI (governance) | `react` types only | `AiDisclosureProps`, `AiDisclosure` | REWORK_REQUIRED |
| `packages/ui/src/button.tsx` | 589 | `a04e168fb422f5d84dee953c33aaa0e763b0c6bacc31f4e5ba44e14f3ab126d9` | react_tsx_component | Shared button primitive | `react` types only | `Button` | IMPORT_CANDIDATE |
| `packages/ui/src/index.ts` | 217 | `c1608f02fd273f9ad87bac2fa15d935a3aec19998188a26b2db12b876af0e884` | barrel_export_ts | Package public barrel | `./button.js`, `./ai-disclosure.js`, `./skip-to-main-link.js` | re-exports components/types | REWORK_REQUIRED |
| `packages/ui/src/skip-to-main-link.tsx` | 1331 | `156c2ca091516df18373d79c452809e20cf010d5042c254a33282e15e6602402` | react_tsx_component | WCAG 2.4.1 skip link | `react` types only | `SkipToMainLinkProps`, `SkipToMainLink` | IMPORT_CANDIDATE |
| `packages/ui/src/styles.css` | 62 | `7a8b07838661bed82405f51991a10179ba7782d7c2acaff54777b49f020bae77` | stylesheet_css | Tailwind entry for package CSS build | _(directives)_ | n/a | IMPORT_CANDIDATE |

## Manifest guards

| Check | Result |
|-------|--------|
| Binary / null-byte | **none** |
| Outside `src/**` except `tokens.ts` | **none** |
| `packages/notification-templates/**` | **not included** |
| Extra UI files discovered | **none** |
