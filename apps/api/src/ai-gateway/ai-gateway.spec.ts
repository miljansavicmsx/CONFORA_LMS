import { completeAiUse, AiGatewayError } from './ai-gateway';
import { quoteAiCost, reservationFits } from './ai-pricing';
import { budgetAllows } from './ai-policy';
import {
  DESIGNATED_PRIMARY_PROVIDER_ID,
  OPENAI_MAX_COMPLETION_UNITS,
  OpenAiProvider,
  selectAiProvider,
  type AiProvider,
} from './ai-provider';

const request = {
  purpose: 'summary',
  dataCategory: 'case_summary',
  system: 'Pomoć.',
  prompt: 'Činjenice.',
};

function provider(
  called: { value: boolean },
  usage = { promptUnits: 2, completionUnits: 1 },
): AiProvider {
  return {
    id: 'deterministic-stub',
    model: 'deterministic-stub',
    plan: () => usage,
    complete: () => {
      called.value = true;
      return Promise.resolve({
        text: 'tekst',
        model: 'deterministic-stub',
        ...usage,
      });
    },
  };
}

describe('AI gateway', () => {
  it('keeps the stub selected and ignores a key in the environment', () => {
    const previous = process.env['OPENAI_API_KEY'];
    process.env['OPENAI_API_KEY'] = 'sk-test-not-used';
    try {
      expect(selectAiProvider().id).toBe('deterministic-stub');
      expect(DESIGNATED_PRIMARY_PROVIDER_ID).toBe('openai');
    } finally {
      if (previous === undefined) {
        delete process.env['OPENAI_API_KEY'];
      } else {
        process.env['OPENAI_API_KEY'] = previous;
      }
    }
  });

  it('prices tokens from the model table and never leaves a positive use at zero', () => {
    expect(quoteAiCost('deterministic-stub', 10, 8)).toBeGreaterThan(0);
    expect(quoteAiCost('gpt-4.1-mini', 4, 3)).toBeGreaterThan(0);
    expect(quoteAiCost('unlisted-model', 1, 1)).toBeGreaterThanOrEqual(
      quoteAiCost('deterministic-stub', 1, 1),
    );
    expect(
      reservationFits(
        { unitLimit: 100, unitsUsed: 0, costLimitMinor: 1, costUsedMinor: 0 },
        3,
        quoteAiCost('deterministic-stub', 2, 1),
      ),
    ).toBe(false);
  });

  it('adapts an OpenAI response without pricing it or selecting it', async () => {
    const seen: { body: string } = { body: '' };
    const adapter = new OpenAiProvider('test-key', (_url, init) => {
      seen.body = init.body;
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: 'Nacrt.' } }],
            usage: { prompt_tokens: 4, completion_tokens: 3 },
          }),
      });
    });
    const result = await adapter.complete({ ...request, dataCategory: 'notice_draft' });
    expect(result.text).toBe('Nacrt.');
    expect(result.promptUnits).toBe(4);
    expect(result).not.toHaveProperty('costMinor');
    expect(JSON.parse(seen.body)).toMatchObject({ max_tokens: OPENAI_MAX_COMPLETION_UNITS });
    expect(selectAiProvider().id).not.toBe(adapter.id);
  });

  it('records a refused category and does not call the provider', async () => {
    const called = { value: false };
    const records: string[] = [];
    await expect(
      completeAiUse({
        request: { ...request, dataCategory: 'item_bank' },
        provider: provider(called),
        reserve: () => Promise.resolve(true),
        release: () => Promise.resolve(),
        record: (entry) => {
          records.push(entry.outcome);
          return Promise.resolve();
        },
      }),
    ).rejects.toBeInstanceOf(AiGatewayError);
    expect(called.value).toBe(false);
    expect(records).toEqual(['DENIED']);
  });

  it('reserves a non-zero cost before the provider and denies when the reservation does not fit', async () => {
    const called = { value: false };
    const order: string[] = [];
    expect(budgetAllows({ unitLimit: 1, unitsUsed: 1, costLimitMinor: 1, costUsedMinor: 0 })).toBe(
      false,
    );
    await expect(
      completeAiUse({
        request,
        provider: provider(called),
        reserve: (units, costMinor) => {
          order.push(`reserve:${String(units)}:${String(costMinor)}`);
          expect(costMinor).toBeGreaterThan(0);
          expect(units).toBeGreaterThan(0);
          return Promise.resolve(false);
        },
        release: () => Promise.resolve(),
        record: (entry) => {
          order.push(entry.outcome);
          return Promise.resolve();
        },
      }),
    ).rejects.toMatchObject({ code: 'BUDGET_EXCEEDED' });
    expect(called.value).toBe(false);
    expect(order).toEqual(['reserve:3:2', 'DENIED']);
  });

  it('audits FAILURE before releasing the reservation when the provider throws', async () => {
    const order: string[] = [];
    const released: number[] = [];
    const failing: AiProvider = {
      id: 'deterministic-stub',
      model: 'deterministic-stub',
      plan: () => ({ promptUnits: 2, completionUnits: 1 }),
      complete: () => Promise.reject(new Error('PROVIDER_DOWN')),
    };
    await expect(
      completeAiUse({
        request,
        provider: failing,
        reserve: () => Promise.resolve(true),
        release: (units, costMinor) => {
          order.push('release');
          released.push(units, costMinor);
          return Promise.resolve();
        },
        record: (entry) => {
          order.push(entry.outcome);
          expect(entry.costMinor).toBeGreaterThan(0);
          return Promise.resolve();
        },
      }),
    ).rejects.toThrow('PROVIDER_DOWN');
    expect(order).toEqual(['FAILURE', 'release']);
    expect(released).toEqual([3, quoteAiCost('deterministic-stub', 2, 1)]);
  });

  it('keeps the FAILURE audit when releasing the reservation throws', async () => {
    const records: string[] = [];
    const failing: AiProvider = {
      id: 'deterministic-stub',
      model: 'deterministic-stub',
      plan: () => ({ promptUnits: 2, completionUnits: 1 }),
      complete: () => Promise.reject(new Error('PROVIDER_DOWN')),
    };
    await expect(
      completeAiUse({
        request,
        provider: failing,
        reserve: () => Promise.resolve(true),
        release: () => Promise.reject(new Error('RELEASE_FAILED')),
        record: (entry) => {
          records.push(entry.outcome);
          return Promise.resolve();
        },
      }),
    ).rejects.toThrow('RELEASE_FAILED');
    expect(records).toEqual(['FAILURE']);
  });

  it('returns a priced suggestion that cannot decide and always requires a person', async () => {
    const result = await completeAiUse({
      request,
      provider: provider({ value: false }),
      reserve: () => Promise.resolve(true),
      release: () => Promise.resolve(),
      record: (entry) => {
        expect(entry.outcome).toBe('SUCCESS');
        expect(entry.costMinor).toBeGreaterThan(0);
        return Promise.resolve();
      },
    });
    expect(result.decides).toBe(false);
    expect(result.humanValidationRequired).toBe(true);
    expect(result.costMinor).toBe(quoteAiCost('deterministic-stub', 2, 1));
  });

  it('drops unused reservation when the provider reports fewer tokens than planned', async () => {
    const released: Array<[number, number]> = [];
    const planned = { promptUnits: 20, completionUnits: 8 };
    const actual = { promptUnits: 4, completionUnits: 2 };
    const result = await completeAiUse({
      request,
      provider: {
        id: 'deterministic-stub',
        model: 'deterministic-stub',
        plan: () => planned,
        complete: () => Promise.resolve({ text: 'tekst', model: 'deterministic-stub', ...actual }),
      },
      reserve: () => Promise.resolve(true),
      release: (units, costMinor) => {
        released.push([units, costMinor]);
        return Promise.resolve();
      },
      record: () => Promise.resolve(),
    });
    const plannedCost = quoteAiCost(
      'deterministic-stub',
      planned.promptUnits,
      planned.completionUnits,
    );
    const actualCost = quoteAiCost(
      'deterministic-stub',
      actual.promptUnits,
      actual.completionUnits,
    );
    expect(released).toEqual([
      [
        planned.promptUnits +
          planned.completionUnits -
          (actual.promptUnits + actual.completionUnits),
        plannedCost - actualCost,
      ],
    ]);
    expect(result.costMinor).toBe(actualCost);
  });
});
