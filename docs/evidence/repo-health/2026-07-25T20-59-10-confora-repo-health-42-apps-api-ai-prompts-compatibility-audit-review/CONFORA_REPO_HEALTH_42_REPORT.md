# CONFORA REPO HEALTH 42 — Report

## Task

CONFORA-REPO-HEALTH-42 — apps/api AI Prompts Compatibility Audit-Only Review

## Baseline

- HEAD / remote: `d15bd2d3`  
- Tracked tree: **not fully clean** (docs/evidence + line-ending porcelain on ai-prompts/i18n; ai-prompts **content** matches HEAD)  
- apps/api tracked: clean  
- HR MJML: 3 deferred  
- Staged: none  

## Callers

- Sole runtime `getPromptBundleV1` / `fillTemplate`: `buildMessages` in `ai-gateway.service.ts`  
- `fillPromptUserTemplateV1`: none  

## Purposes

- AiPurpose: 10 values  
- Closed prompts: 5 (`default` not in AiPurpose)  
- Non-closed: 6 including `question.explain`  

## Messages-empty path

**Exists.** Empty messages → loader. Non-closed → throw. Closed → fillTemplate with placeholders.

## Classification

- SAFE paths: messages present; `chat.support` complete; `risk.suggest` / `question.generate` internal with good input  
- COMPATIBILITY_RISK: HTTP invoke with non-closed or incomplete placeholders  
- REWORK_REQUIRED: course-authoring `content.draft` (×2); exam-engine `analysis.exam_result`  

## Governance / security / architecture

- Workflow blocking: 0  
- Security/privacy findings: 0 (provider env keys documented, not hardcoded)  
- Fix in apps/api; keep ai-prompts; no revert  

## Validation

Static closed-vs-purpose check PASS. Targeted Nest tests not run (documented).

## Verdict

**CONFORA_REPO_HEALTH_42_APPS_API_COMPATIBILITY_AUDIT_READY_FOR_REVIEW**

Next: `RH43_APPS_API_AI_PROMPTS_COMPATIBILITY_REWORK_EMPTY_MESSAGES_AND_NON_CLOSED_PURPOSES`
