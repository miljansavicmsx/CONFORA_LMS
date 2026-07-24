# CONFORA-REPO-HEALTH-24 — Residual Guardrails

| ID | Guardrail | Severity | Action |
|----|-----------|----------|--------|
| RG-01 | `SkipToMainLink` English default label | Residual UX/i18n | Product consumers **must** pass translated `label` or `children` |
| RG-02 | `package.json` points `main`/`types` at `./dist/*` | Build hygiene | Consumers/CI must build before runtime consume of package entry; `dist` not in git (intentional) |
| RG-03 | `tokens.ts` English metadata labels | Design-system only | Do not treat as product UI copy; keep out of end-user strings |
| RG-04 | Notification template sources still deferred | Wave sequencing | Do not import without W2D-2 audit-only review |
| RG-05 | Violet Tailwind utilities on `AiDisclosure` | Design | Presentational styling only; not a governance claim |

## Integrity status with residuals

Package integrity can still **PASS** with RG-01 documented as residual (same posture as RH20/RH23).
