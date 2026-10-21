import { createHash } from 'node:crypto';

import { fillPromptUserTemplateV1, getPromptBundleV1 } from '@confora/ai-prompts';

import type { AiDataCategory } from '../ai-gateway/ai-policy';

export const CASE_SUGGESTION_PURPOSES = [
  'completeness',
  'summary',
  'inconsistencies',
  'committee',
  'notification',
] as const;

export type CaseSuggestionPurpose = (typeof CASE_SUGGESTION_PURPOSES)[number];

const CATEGORY: Record<CaseSuggestionPurpose, AiDataCategory> = {
  completeness: 'dossier_facts',
  summary: 'case_summary',
  inconsistencies: 'experience_notes',
  committee: 'committee_slate',
  notification: 'notice_draft',
};

/** Builds the allowlisted prompt. The gateway, not this module, calls a provider. */
export function prepareAssistPrompt(
  purpose: CaseSuggestionPurpose,
  facts: string,
): { dataCategory: AiDataCategory; system: string; prompt: string; promptHash: string } {
  const bundle = getPromptBundleV1('certification.assist');
  const filled = fillPromptUserTemplateV1('certification.assist', {
    dossier_facts: `${purpose}\n${facts}`,
  });
  return {
    dataCategory: CATEGORY[purpose],
    system: bundle.system,
    prompt: filled,
    promptHash: createHash('sha256').update(`${bundle.system}\n${filled}`).digest('hex'),
  };
}

export function labelSuggestion(text: string): string {
  return `Prijedlog (nije odluka): ${text}`;
}
