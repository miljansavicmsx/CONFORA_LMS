import { z } from 'zod';

import type { paths as ApiPaths } from './generated/schema.js';

export type Paths = ApiPaths;

/** Placeholder until OpenAPI code generation is wired in CI. */
const configurationSchema = z.object({
  baseUrl: z.string().url(),
});

export type SdkConfiguration = z.infer<typeof configurationSchema>;

export function createConforaSdk(config: unknown) {
  const parsed = configurationSchema.parse(config);
  return {
    baseUrl: parsed.baseUrl,
    /** Fetch OpenAPI spec (Nest serves JSON at this path in bootstrap). */
    async getOpenApiJson(): Promise<unknown> {
      const response = await fetch(`${parsed.baseUrl}/openapi/json`);
      if (!response.ok) {
        throw new Error(`OpenAPI fetch failed: ${String(response.status)}`);
      }
      const body: unknown = await response.json();
      return body;
    },
  };
}
