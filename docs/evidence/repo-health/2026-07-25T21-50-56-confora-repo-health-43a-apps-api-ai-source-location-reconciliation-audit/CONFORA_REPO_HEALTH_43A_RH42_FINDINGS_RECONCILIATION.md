# CONFORA REPO HEALTH 43A — RH42 Findings Reconciliation

## RH42 claimed rework targets

1. `apps/api/src/ai/ai-gateway.service.ts`
2. `apps/api/src/course-authoring/course-authoring.service.ts`
3. `apps/api/src/exam/exam-engine.service.ts`

## Grounding assessment

| Question | Answer |
|----------|--------|
| Grounded in **tracked** canonical source? | **No** |
| Present as tracked files at HEAD `4f2cbe12`? | **No** |
| Present as on-disk `apps/api/src/**` TypeScript now? | **No** |
| Reflected in generated `dist` / coverage? | **Yes** |

## RH42 self-annotation (important)

RH42 `summary.json` already recorded:

- `apps_api_ai_module_untracked: true`
- `apps_api_tracked_file_count: 20`

So RH42 inventoried **untracked** working-tree modules, not the git-tracked slice. That untracked source is **no longer on disk** at RH43A time.

## Classification of RH42 caller inventory origin

**Primary:** untracked source at RH42 audit time (now absent).  
**Corroboration:** generated `apps/api/dist/**` and `apps/api/coverage/**` HTML still contain the compiled/report copies of those paths.  
**Not:** tracked canonical source.  
**Not:** currently present untracked `.ts` (directories `apps/api/src/ai`, `course-authoring`, `exam` do not exist).

## Implication

RH42 technical analysis of fail-closed loader vs empty-messages / non-closed purposes remains a valid **risk hypothesis for when/if that AI source is restored**, but it is **not** an actionable patch against current tracked `apps/api/src`.

**rh42_findings_grounded_in_tracked_source:** false
