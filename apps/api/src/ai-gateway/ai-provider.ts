import type { AiDataCategory } from './ai-policy';

export type AiCompletionRequest = {
  purpose: string;
  dataCategory: AiDataCategory;
  system: string;
  prompt: string;
};

export type AiUsage = {
  promptUnits: number;
  completionUnits: number;
};

export type AiProviderResult = AiUsage & {
  text: string;
  model: string;
};

export interface AiProvider {
  readonly id: string;
  readonly model: string;
  plan(request: AiCompletionRequest): AiUsage;
  complete(request: AiCompletionRequest): Promise<AiProviderResult>;
}

/** Owner-designated primary provider. The runtime does not construct it. */
export const DESIGNATED_PRIMARY_PROVIDER_ID = 'openai';

export const OPENAI_MODEL = 'gpt-4.1-mini';
export const OPENAI_MAX_COMPLETION_UNITS = 1024;

export class StubAiProvider implements AiProvider {
  readonly id = 'deterministic-stub';
  readonly model = 'deterministic-stub';

  plan(request: AiCompletionRequest): AiUsage {
    return {
      promptUnits: Math.min(32, Math.max(1, request.prompt.length)),
      completionUnits: 8,
    };
  }

  complete(request: AiCompletionRequest): Promise<AiProviderResult> {
    return Promise.resolve({
      text: `Sažetak ulaza (${request.dataCategory}).`,
      model: this.model,
      ...this.plan(request),
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
 * Cost is not computed here.
 */
export class OpenAiProvider implements AiProvider {
  readonly id = DESIGNATED_PRIMARY_PROVIDER_ID;
  readonly model = OPENAI_MODEL;

  constructor(
    private readonly apiKey: string,
    private readonly http: AiHttp,
  ) {}

  plan(request: AiCompletionRequest): AiUsage {
    return {
      promptUnits: Math.max(1, request.system.length + request.prompt.length),
      completionUnits: OPENAI_MAX_COMPLETION_UNITS,
    };
  }

  async complete(request: AiCompletionRequest): Promise<AiProviderResult> {
    const response = await this.http('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: OPENAI_MAX_COMPLETION_UNITS,
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
    return {
      text,
      model: this.model,
      promptUnits: numberOrZero(json.usage?.prompt_tokens),
      completionUnits: numberOrZero(json.usage?.completion_tokens),
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
