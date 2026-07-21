import type { paths as ApiPaths } from './generated/schema.js';

export type Paths = ApiPaths;

export type SdkConfiguration = Record<string, never>;

export const CONFORA_SDK_STATUS = 'placeholder_no_runtime_transport' as const;

/**
 * Inert SDK entry point until the approved OpenAPI generation workflow is wired.
 * This placeholder intentionally performs no network calls and no credential handling.
 */
export function createConforaSdk(_config: SdkConfiguration = {}) {
  return Object.freeze({
    status: CONFORA_SDK_STATUS,
  });
}
