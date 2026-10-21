import type { AiDataCategory } from './ai-policy';

export type AiCompletionRequest = {
  purpose: string;
  dataCategory: AiDataCategory;
  system: string;
  prompt: string;
};

export type AiProviderResult = {
  text: string;
  model: string;
  promptUnits: number;
  completionUnits: number;
  costMinor: number;
};

export interface AiProvider {
  readonly id: string;
  complete(request: AiCompletionRequest): Promise<AiProviderResult>;
}

/** Owner-designated primary provider. The runtime does not construct it. */
export const DESIGNATED_PRIMARY_PROVIDER_ID = 'openai';

export class StubAiProvider implements AiProvider {
  readonly id = 'deterministic-stub';

  complete(request: AiCompletionRequest): Promise<AiProviderResult> {
    const promptUnits = Math.min(32, Math.max(1, request.prompt.length));
    return Promise.resolve({
      text: `Sažetak ulaza (${request.dataCategory}).`,
      model: this.id,
      promptUnits,
      completionUnits: 8,
      costMinor: 0,
    });
  }
}

type AiHttpResponse = {
  ok: boolean;
  json: () => Promise<unknown>;
};

export type AiHttp = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<AiHttpResponse>;

/**
 * OpenAI chat adapter. Present so the gateway has one provider contract.
 * Nothing in the process selects this class, and no API key is read.
 */
export class OpenAiProvider implements AiProvider {
  readonly id = DESIGNATED_PRIMARY_PROVIDER_ID;

  constructor(
    private readonly apiKey: string,
    private readonly http: AiHttp,
    private readonly model = 'gpt-4.1-mini',
  ) {}

  async complete(request: AiCompletionRequest): Promise<AiProviderResult> {
    const response = await this.http('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: request.system },
          { role: 'user', content: request.prompt },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error('OPENAI_UNAVAILABLE');
    }
    const json = (await response.json()) as {
      choices?: { message?: { content?: unknown } }[];
      usage?: { prompt_tokens?: unknown; completion_tokens?: unknown };
    };
    const text = json.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || text.length === 0) {
      throw new Error('OPENAI_EMPTY');
    }
    const promptUnits = numberOrZero(json.usage?.prompt_tokens);
    const completionUnits = numberOrZero(json.usage?.completion_tokens);
    return {
      text,
      model: this.model,
      promptUnits,
      completionUnits,
      costMinor: 0,
    };
  }
}

function numberOrZero(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/** Stub until a later decision wires a key. Environment variables are ignored. */
export function selectAiProvider(): AiProvider {
  return new StubAiProvider();
}
