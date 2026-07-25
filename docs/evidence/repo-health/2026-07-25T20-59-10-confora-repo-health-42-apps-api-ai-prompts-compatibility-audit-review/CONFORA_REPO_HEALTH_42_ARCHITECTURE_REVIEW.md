# CONFORA REPO HEALTH 42 — Architecture Review

| Question | Answer |
|----------|--------|
| Can compatibility be fixed inside apps/api only? | **Yes** (primary). Optional later align of `aiPurposeSchema` in `packages/ai-client`. |
| package.json / lockfile / workspace required? | **No** for minimal fix |
| DB / auth / migration / frontend required? | **No** unless product adds new governed prompts |
| Keep `packages/ai-prompts` import? | **Yes** — remains valid |
| Revert ai-prompts? | **No** |

## Recommended architecture for RH43 (do not implement here)

1. In `buildMessages` / `invoke`: if messages empty and purpose ∉ closed prompt IDs → `BadRequestException` with clear message (or require messages).  
2. Fix REWORK_REQUIRED callers to pass explicit `messages[]` (or add governed prompt JSON + closed ID via separate package wave — higher bar).  
3. Do **not** restore default fallback in ai-prompts.  
4. Add unit tests for empty-messages non-closed and closed+missing-placeholder cases.

## Optional

Align `packages/ai-client` purposes with closed prompt set over time — not required to unblock apps-side fail-closed mapping.
