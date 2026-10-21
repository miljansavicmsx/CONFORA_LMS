import { randomUUID } from 'node:crypto';

import { quoteAiCost } from './ai-pricing';
import { isAiDataCategory, type AiDataCategory } from './ai-policy';
import type { AiProvider, AiUsage } from './ai-provider';

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
  outcome: 'SUCCESS' | 'DENIED' | 'FAILURE';
  model: string;
  dataCategory: string;
  promptUnits: number;
  completionUnits: number;
  costMinor: number;
};

/**
 * Single completion entry. Callers never talk to a provider.
 * Cost comes from the model price table. The budget reservation is taken before the provider call
 * and released or reduced to the actual quote afterwards.
 * A provider exception is audited as FAILURE and then rethrown.
 * The result cannot carry a decision: humanValidationRequired stays true and decides stays false.
 */
export async function completeAiUse(input: {
  request: { purpose: string; dataCategory: string; system: string; prompt: string };
  provider: AiProvider;
  reserve: (units: number, costMinor: number) => Promise<boolean>;
  release: (units: number, costMinor: number) => Promise<void>;
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
  const planned = input.provider.plan({
    purpose,
    dataCategory,
    system: input.request.system,
    prompt: input.request.prompt,
  });
  const reservedCost = quoteAiCost(
    input.provider.model,
    planned.promptUnits,
    planned.completionUnits,
  );
  const reservedUnits = planned.promptUnits + planned.completionUnits;
  const reserved = await input.reserve(reservedUnits, reservedCost);
  if (!reserved) {
    await input.record(denied(useId, dataCategory));
    throw new AiGatewayError('BUDGET_EXCEEDED');
  }
  let raw: { text: string; model: string } & AiUsage;
  try {
    raw = await input.provider.complete({
      purpose,
      dataCategory,
      system: input.request.system,
      prompt: input.request.prompt,
    });
  } catch (error) {
    await input.release(reservedUnits, reservedCost);
    await input.record({
      useId,
      outcome: 'FAILURE',
      model: input.provider.model,
      dataCategory,
      promptUnits: planned.promptUnits,
      completionUnits: planned.completionUnits,
      costMinor: reservedCost,
    });
    throw error;
  }
  const actualCost = quoteAiCost(raw.model, raw.promptUnits, raw.completionUnits);
  const actualUnits = raw.promptUnits + raw.completionUnits;
  const settled = await settleReservation(input, {
    reservedUnits,
    reservedCost,
    actualUnits,
    actualCost,
  });
  if (!settled) {
    await input.record({
      useId,
      outcome: 'FAILURE',
      model: raw.model,
      dataCategory,
      promptUnits: raw.promptUnits,
      completionUnits: raw.completionUnits,
      costMinor: actualCost,
    });
    throw new AiGatewayError('BUDGET_EXCEEDED');
  }
  const result: AiGatewayResult = {
    useId,
    text: raw.text,
    model: raw.model,
    providerId: input.provider.id,
    dataCategory,
    promptUnits: raw.promptUnits,
    completionUnits: raw.completionUnits,
    costMinor: actualCost,
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

async function settleReservation(
  input: {
    reserve: (units: number, costMinor: number) => Promise<boolean>;
    release: (units: number, costMinor: number) => Promise<void>;
  },
  quote: {
    reservedUnits: number;
    reservedCost: number;
    actualUnits: number;
    actualCost: number;
  },
): Promise<boolean> {
  const extraUnits = Math.max(0, quote.actualUnits - quote.reservedUnits);
  const extraCost = Math.max(0, quote.actualCost - quote.reservedCost);
  if (extraUnits > 0 || extraCost > 0) {
    const extra = await input.reserve(extraUnits, extraCost);
    if (!extra) {
      await input.release(quote.reservedUnits, quote.reservedCost);
      return false;
    }
  }
  const unusedUnits = Math.max(0, quote.reservedUnits - quote.actualUnits);
  const unusedCost = Math.max(0, quote.reservedCost - quote.actualCost);
  await input.release(unusedUnits, unusedCost);
  return true;
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
