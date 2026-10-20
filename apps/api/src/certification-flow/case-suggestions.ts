import { createHash } from 'node:crypto';

import { aiMetadataSchema } from '@confora/ai-client';
import { fillPromptUserTemplateV1, getPromptBundleV1 } from '@confora/ai-prompts';

export const CASE_SUGGESTION_PURPOSES = [
  'completeness',
  'summary',
  'inconsistencies',
  'committee',
  'notification',
] as const;

export type CaseSuggestionPurpose = (typeof CASE_SUGGESTION_PURPOSES)[number];

function stubText(purpose: CaseSuggestionPurpose, facts: string): string {
  const lines: Record<CaseSuggestionPurpose, string> = {
    completeness: `Provjera kompletnosti dosijea prema listi šeme. Činjenice: ${facts}`,
    summary: `Sažetak predmeta za odbor. Činjenice: ${facts}`,
    inconsistencies: `Moguće nesaglasnosti u dokazima iskustva. Činjenice: ${facts}`,
    committee: `Obrazloženje predloženog sastava, uz isključenje sukoba interesa. Činjenice: ${facts}`,
    notification: `Nacrt podsjetnika ili obavijesti. Činjenice: ${facts}`,
  };
  return lines[purpose];
}

/**
 * Assistive text only. No item-bank access and no certification outcome.
 * Without a key the result is a deterministic stub. A key without an endpoint stays a stub.
 */
export async function suggestCaseText(
  purpose: CaseSuggestionPurpose,
  facts: string,
): Promise<{
  suggestion: string;
  model: string;
  promptHash: string;
  isAiGenerated: true;
  label: 'Prijedlog';
  decides: false;
}> {
  const bundle = getPromptBundleV1('certification.assist');
  const filled = fillPromptUserTemplateV1('certification.assist', {
    dossier_facts: `${purpose}\n${facts}`,
  });
  const promptHash = createHash('sha256').update(`${bundle.system}\n${filled}`).digest('hex');
  const key = process.env['CERTIFICATION_AI_API_KEY'];
  const base = process.env['CERTIFICATION_AI_BASE_URL'];
  let model = 'deterministic-stub';
  let remote: string | null = null;
  if (key && !base) {
    model = 'key-present-no-endpoint';
  } else if (key && base) {
    model = 'remote-provider';
    remote = await readRemoteSuggestion(base, key, filled);
  }
  const body = remote ?? stubText(purpose, facts);
  const suggestion = `Prijedlog (nije odluka): ${body}`;
  const meta = aiMetadataSchema.parse({
    isAiGenerated: true as const,
    aiModel: model,
    aiModelVersion: bundle.version,
    aiPromptHash: promptHash,
  });
  return {
    suggestion,
    model: meta.aiModel,
    promptHash: meta.aiPromptHash,
    isAiGenerated: true,
    label: 'Prijedlog',
    decides: false,
  };
}

async function readRemoteSuggestion(
  base: string,
  key: string,
  prompt: string,
): Promise<string | null> {
  try {
    const response = await fetch(base, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) {
      return null;
    }
    const json = (await response.json()) as { text?: unknown };
    return typeof json.text === 'string' && json.text.length > 0 ? json.text : null;
  } catch {
    return null;
  }
}
