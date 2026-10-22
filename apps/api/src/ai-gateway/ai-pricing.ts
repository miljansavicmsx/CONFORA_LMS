/** Minor currency units per 1_000_000 tokens. Unknown models use the highest rate. */
export const MODEL_PRICE_PER_MILLION: Readonly<
  Record<string, { readonly prompt: number; readonly completion: number }>
> = {
  'deterministic-stub': { prompt: 100_000, completion: 200_000 },
  'gpt-4.1-mini': { prompt: 40, completion: 160 },
};

export function quoteAiCost(model: string, promptUnits: number, completionUnits: number): number {
  const listed = MODEL_PRICE_PER_MILLION[model];
  const price = listed ?? highestPrice();
  return charge(promptUnits, price.prompt) + charge(completionUnits, price.completion);
}

export function reservationFits(
  row: {
    readonly unitLimit: number;
    readonly unitsUsed: number;
    readonly costLimitMinor: number;
    readonly costUsedMinor: number;
  },
  units: number,
  costMinor: number,
): boolean {
  return (
    row.unitsUsed + units <= row.unitLimit && row.costUsedMinor + costMinor <= row.costLimitMinor
  );
}

function charge(units: number, perMillion: number): number {
  if (!Number.isInteger(units) || units <= 0 || perMillion <= 0) {
    return 0;
  }
  return Math.ceil((units * perMillion) / 1_000_000);
}

function highestPrice(): { readonly prompt: number; readonly completion: number } {
  let prompt = 0;
  let completion = 0;
  for (const price of Object.values(MODEL_PRICE_PER_MILLION)) {
    prompt = Math.max(prompt, price.prompt);
    completion = Math.max(completion, price.completion);
  }
  return { prompt, completion };
}
