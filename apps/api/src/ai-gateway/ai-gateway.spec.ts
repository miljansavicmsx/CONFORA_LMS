import { completeAiUse, AiGatewayError } from './ai-gateway';
import { budgetAllows } from './ai-policy';
import {
  DESIGNATED_PRIMARY_PROVIDER_ID,
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

function provider(called: { value: boolean }): AiProvider {
  return {
    id: 'deterministic-stub',
    complete: () => {
      called.value = true;
      return Promise.resolve({
        text: 'tekst',
        model: 'deterministic-stub',
        promptUnits: 2,
        completionUnits: 1,
        costMinor: 0,
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

  it('adapts an OpenAI response without being the selected provider', async () => {
    const seen: { authorization: string } = { authorization: '' };
    const adapter = new OpenAiProvider('test-key', (url, init) => {
      seen.authorization = init.headers['Authorization'] ?? '';
      expect(url).toBe('https://api.openai.com/v1/chat/completions');
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
    expect(result.costMinor).toBe(0);
    expect(seen.authorization).toBe('Bearer test-key');
    expect(selectAiProvider().id).not.toBe(adapter.id);
  });

  it('records a refused category and does not call the provider', async () => {
    const called = { value: false };
    const records: string[] = [];
    await expect(
      completeAiUse({
        request: { ...request, dataCategory: 'item_bank' },
        provider: provider(called),
        budget: { unitLimit: 10, unitsUsed: 0, costLimitMinor: 10, costUsedMinor: 0 },
        persistUsage: () => Promise.resolve(),
        record: (entry) => {
          records.push(entry.outcome);
          return Promise.resolve();
        },
      }),
    ).rejects.toBeInstanceOf(AiGatewayError);
    expect(called.value).toBe(false);
    expect(records).toEqual(['DENIED']);
  });

  it('records a budget refusal and does not call the provider', async () => {
    const called = { value: false };
    expect(budgetAllows({ unitLimit: 1, unitsUsed: 1, costLimitMinor: 1, costUsedMinor: 0 })).toBe(
      false,
    );
    await expect(
      completeAiUse({
        request,
        provider: provider(called),
        budget: { unitLimit: 1, unitsUsed: 1, costLimitMinor: 5, costUsedMinor: 0 },
        persistUsage: () => Promise.resolve(),
        record: () => Promise.resolve(),
      }),
    ).rejects.toMatchObject({ code: 'BUDGET_EXCEEDED' });
    expect(called.value).toBe(false);
  });

  it('returns a suggestion that cannot decide and always requires a person', async () => {
    const result = await completeAiUse({
      request,
      provider: provider({ value: false }),
      budget: { unitLimit: 10, unitsUsed: 0, costLimitMinor: 10, costUsedMinor: 0 },
      persistUsage: () => Promise.resolve(),
      record: () => Promise.resolve(),
    });
    expect(result.decides).toBe(false);
    expect(result.humanValidationRequired).toBe(true);
    expect(result.model).toBe('deterministic-stub');
  });
});
