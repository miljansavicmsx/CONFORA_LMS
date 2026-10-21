import { randomUUID } from 'node:crypto';

import { budgetAllows, isAiDataCategory, type AiBudgetRow, type AiDataCategory } from './ai-policy';
import type { AiProvider } from './ai-provider';

export class AiGatewayError extends Error {
  constructor(readonly code: 'CATEGORY_DENIED' | 'BUDGET_EXCEEDED' | 'PURPOSE_DENIED') {
    super(code);
    this.name = 'AiGatewayError';
  }
}

export type AiGatewayResult = {
  useId: string;
  text: string;
  model: string;
  providerId: string;
  dataCategory: AiDataCategory;
  promptUnits: number;
  completionUnits: number;
  costMinor: number;
  humanValidationRequired: true;
  decides: false;
};

export type AiUseRecord = {
  useId: string;
  outcome: 'SUCCESS' | 'DENIED';
  model: string;
  dataCategory: string;
  promptUnits: number;
  completionUnits: number;
  costMinor: number;
};

/**
 * Single completion entry. Callers never talk to a provider.
 * Every path, including a refused category or budget, records the use first.
 * The result cannot carry a decision: humanValidationRequired stays true and decides stays false.
 */
export async function completeAiUse(input: {
  request: { purpose: string; dataCategory: string; system: string; prompt: string };
  provider: AiProvider;
  budget: AiBudgetRow;
  persistUsage: (promptUnits: number, completionUnits: number, costMinor: number) => Promise<void>;
  record: (entry: AiUseRecord) => Promise<void>;
}): Promise<AiGatewayResult> {
  const useId = randomUUID();
  const purpose = input.request.purpose.trim();
  const dataCategory = input.request.dataCategory;
  if (purpose.length === 0 || purpose.length > 64) {
    await input.record(denied(useId, dataCategory || 'rejected'));
    throw new AiGatewayError('PURPOSE_DENIED');
  }
  if (!isAiDataCategory(dataCategory)) {
    await input.record(denied(useId, dataCategory || 'rejected'));
    throw new AiGatewayError('CATEGORY_DENIED');
  }
  if (!budgetAllows(input.budget)) {
    await input.record(denied(useId, dataCategory));
    throw new AiGatewayError('BUDGET_EXCEEDED');
  }
  const raw = await input.provider.complete({
    purpose,
    dataCategory,
    system: input.request.system,
    prompt: input.request.prompt,
  });
  await input.persistUsage(raw.promptUnits, raw.completionUnits, raw.costMinor);
  const result: AiGatewayResult = {
    useId,
    text: raw.text,
    model: raw.model,
    providerId: input.provider.id,
    dataCategory,
    promptUnits: raw.promptUnits,
    completionUnits: raw.completionUnits,
    costMinor: raw.costMinor,
    humanValidationRequired: true,
    decides: false,
  };
  await input.record({
    useId,
    outcome: 'SUCCESS',
    model: result.model,
    dataCategory: result.dataCategory,
    promptUnits: result.promptUnits,
    completionUnits: result.completionUnits,
    costMinor: result.costMinor,
  });
  return result;
}

function denied(useId: string, dataCategory: string): AiUseRecord {
  return {
    useId,
    outcome: 'DENIED',
    model: 'none',
    dataCategory,
    promptUnits: 0,
    completionUnits: 0,
    costMinor: 0,
  };
}
