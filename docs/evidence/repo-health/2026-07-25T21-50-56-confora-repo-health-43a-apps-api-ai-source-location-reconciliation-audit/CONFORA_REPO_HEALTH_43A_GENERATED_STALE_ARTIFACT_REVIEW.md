# CONFORA REPO HEALTH 43A — Generated / Stale Artifact Review

## Policy

This task does **not** delete `dist`, `coverage`, `node_modules`, or `.turbo`.

## Dist hits (present)

| Artifact | Pattern relevance |
|----------|-------------------|
| `apps/api/dist/ai/ai-gateway.service.js` | `getPromptBundleV1(purpose)` |
| `apps/api/dist/ai/providers/ai-provider.routing.js` | `question.explain`, `content.draft`, `analysis.exam_result` |
| `apps/api/dist/course-authoring/course-authoring.service.js` | `purpose: 'content.draft'` (×2) |
| `apps/api/dist/exam/exam-engine.service.js` | `purpose: 'analysis.exam_result'` |
| Related sysadmin/lms dist | `AiPurpose` policy / hint strings |

## Coverage HTML hits (present)

| Artifact | Pattern relevance |
|----------|-------------------|
| `apps/api/coverage/lcov-report/src/ai/ai-gateway.service.ts.html` | imports `getPromptBundleV1` / `fillTemplate` |
| `apps/api/coverage/lcov-report/src/ai/providers/ai-provider.routing.ts.html` | non-closed purposes |
| `apps/api/coverage/lcov-report/src/course-authoring/course-authoring.service.ts.html` | `content.draft` |
| `apps/api/coverage/lcov-report/src/exam/exam-engine.service.ts.html` | `analysis.exam_result` |

## Classification

These are **generated/stale artifacts**, not canonical tracked source. They corroborate that RH42-described code **existed previously** (or was built from untracked source) but **must not** be treated as the editable import surface for RH43 rework.

## Do not

- Treat `dist` / coverage as source of truth for patches  
- Import or commit `dist` / coverage  
- Delete them in this audit task  
