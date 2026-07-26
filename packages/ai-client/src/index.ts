import { z } from 'zod';

export const aiPurposeSchema = z.enum([
  'chat.educational',
  'chat.support',
  'question.generate',
  'question.explain',
  'proctoring.video',
  'proctoring.audio',
  'risk.suggest',
  'analysis.exam_result',
  'content.draft',
  'translate.i18n',
]);

export type AiPurpose = z.infer<typeof aiPurposeSchema>;

/** Purposes that interact with end users — disclosure must be shown (gateway enforces). */
export const USER_FACING_AI_PURPOSES: ReadonlySet<AiPurpose> = new Set([
  'chat.educational',
  'chat.support',
  'question.explain',
  'proctoring.video',
  'proctoring.audio',
  'content.draft',
  'translate.i18n',
]);

/** Stored as PendingValidation until SME / authorized acceptance (not auto-persisted to certification records). */
export const CERTIFICATION_RELEVANT_AI_PURPOSES: ReadonlySet<AiPurpose> = new Set([
  'question.generate',
  'risk.suggest',
  'analysis.exam_result',
]);

export function isUserFacingAiPurpose(purpose: AiPurpose): boolean {
  return USER_FACING_AI_PURPOSES.has(purpose);
}

export function isCertificationRelevantAiPurpose(purpose: AiPurpose): boolean {
  return CERTIFICATION_RELEVANT_AI_PURPOSES.has(purpose);
}

export const aiMetadataSchema = z.object({
  isAiGenerated: z.literal(true),
  aiModel: z.string().min(1),
  aiModelVersion: z.string().min(1),
  aiPromptHash: z.string().min(1),
});

export type AiRecordMetadata = z.infer<typeof aiMetadataSchema>;

export const aiGatewayResponseSchema = z.object({
  content: z.unknown(),
  model: z.string(),
  model_version: z.string(),
  prompt_hash: z.string(),
  response_hash: z.string(),
  is_ai_generated: z.literal(true),
  suggested_sme_validation: z.boolean(),
  suggestion_id: z.string().uuid().optional(),
});

export type AiGatewayResponse = z.infer<typeof aiGatewayResponseSchema>;

export const aiGatewayInvokeRequestSchema = z.object({
  purpose: aiPurposeSchema,
  messages: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string(),
      }),
    )
    .optional(),
  /** Variables merged into prompt template `user_template` (e.g. user_message, context). */
  input: z.record(z.string(), z.unknown()).optional(),
  resource_type: z.string().optional(),
  resource_id: z.string().uuid().optional(),
  human_oversight_required: z.boolean().optional().default(true),
  disclosure_shown: z.boolean(),
});

export type AiGatewayInvokeRequest = z.infer<typeof aiGatewayInvokeRequestSchema>;

export type AiGatewayClientConfig = {
  /** Base URL for the internal AI Gateway (Nest `apps/api`). */
  baseUrl: string;
  getAccessToken?: () => Promise<string | undefined>;
};

/** Legacy request body for POST /v1/ai/complete (prefer aiGatewayInvokeRequestSchema + /invoke). */
export const completionRequestSchema = z.object({
  featureKey: z.string().min(1),
  input: z.record(z.string(), z.unknown()),
  disclosure_shown: z.boolean().optional(),
});

export type AiCompletionRequest = z.infer<typeof completionRequestSchema>;

/**
 * Invoke the centralized AI Gateway (ISO §6.5 — no direct vendor calls).
 */
export async function invokeAiGateway(
  config: AiGatewayClientConfig,
  request: AiGatewayInvokeRequest,
): Promise<AiGatewayResponse> {
  const parsed = z
    .object({
      baseUrl: z.string().url(),
    })
    .parse({ baseUrl: config.baseUrl });

  const body = aiGatewayInvokeRequestSchema.parse(request);
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  const token = await config.getAccessToken?.();
  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${parsed.baseUrl}/v1/ai/invoke`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`AI Gateway request failed: ${String(response.status)}`);
  }

  const payload: unknown = await response.json();
  return aiGatewayResponseSchema.parse(payload);
}

/**
 * @deprecated Use invokeAiGateway — maps legacy key to chat.support purpose.
 */
export function createAiGatewayClient(config: AiGatewayClientConfig) {
  const parsed = z
    .object({
      baseUrl: z.string().url(),
    })
    .parse({ baseUrl: config.baseUrl });

  return {
    async complete(request: AiCompletionRequest): Promise<unknown> {
      const body = completionRequestSchema.parse(request);
      const headers: Record<string, string> = {
        'content-type': 'application/json',
      };
      const token = await config.getAccessToken?.();
      if (token) {
        headers['authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${parsed.baseUrl}/v1/ai/complete`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`AI Gateway request failed: ${String(response.status)}`);
      }

      return response.json() as Promise<unknown>;
    },
  };
}
