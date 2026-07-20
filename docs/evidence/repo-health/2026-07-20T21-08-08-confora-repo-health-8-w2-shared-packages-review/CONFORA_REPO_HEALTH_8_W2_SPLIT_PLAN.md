# CONFORA-REPO-HEALTH-8 — W2 split plan

Do **not** run `git add packages` or `git add packages/`.

| Sub-wave | Scope | Approx | Gate |
|----------|-------|-------:|------|
| **W2A** | Package manifests + tsconfigs (+ `config/typescript/*`, `ui` postcss/tailwind configs) | **26** explicit files | Low — first commit after review |
| **W2B** | `shared-types/src/**` + `shared-kernel/src/**` (+ READMEs/tests colocated) | ~15 | Skim auth/roles/tenant types |
| **W2C** | `config` eslint/prettier/csp scripts; `audit-client/src/**`; `sdk/src/**`; optionally `ui/src/**` + `notification-templates` | ~40 | Review generated SDK schema |
| **Defer** | `auth`, `audit`, `types`, `ai-*` READMEs/sources; `ai-client` build artifacts | stubs + AI | Later / governance |
| **Do not import yet** | `packages/database/**` | 75 | Separate DB/migration wave |

## Commit hygiene

- Explicit path lists only
- One sub-wave → one commit (or few)
- Preserve boundaries: packages must not smuggle certification decision logic into education packages (N/A for W2A manifests)
