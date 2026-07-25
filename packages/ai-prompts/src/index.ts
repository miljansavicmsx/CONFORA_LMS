import { join } from 'node:path';

/**
 * Safe local prompt registry for @confora/ai-prompts.
 *
 * - No fs I/O at module import time (lazy load on first request).
 * - Closed prompt-ID allowlist (no arbitrary paths).
 * - fillTemplate fails closed on unknown/missing/leftover placeholders.
 * - No network, providers, process.env, or model invocation.
 */

export type PromptBundle = {
  version: string;
  purpose: string;
  reviewNote: string;
  system: string;
  user_template: string;
};

/** Closed set of loadable prompt IDs (maps 1:1 to prompts/v1/*.json basenames). */
export const AI_PROMPT_IDS_V1 = [
  'chat.educational',
  'chat.support',
  'question.generate',
  'risk.suggest',
  'default',
] as const;

export type AiPromptIdV1 = (typeof AI_PROMPT_IDS_V1)[number];

const PROMPT_ID_SET: ReadonlySet<string> = new Set(AI_PROMPT_IDS_V1);

/** Allowed `{{placeholder}}` names per prompt (user_template). */
export const AI_PROMPT_PLACEHOLDERS_V1: Readonly<Record<AiPromptIdV1, readonly string[]>> = {
  'chat.educational': ['context', 'user_message'],
  'chat.support': ['user_message'],
  'question.generate': ['blueprint', 'constraints'],
  'risk.suggest': ['audit_events_last_30d', 'complaints_by_subject', 'instruction'],
  default: ['user_message'],
};

const PLACEHOLDER_RE = /\{\{([a-zA-Z0-9_]+)\}\}/g;
const TRIPLE_BRACE_RE = /\{\{\{/;
const LEFTOVER_RE = /\{\{[a-zA-Z0-9_]+\}\}/;

const cache = new Map<AiPromptIdV1, PromptBundle>();

function isAiPromptIdV1(value: string): value is AiPromptIdV1 {
  return PROMPT_ID_SET.has(value);
}

function promptsDir(): string {
  return join(__dirname, '..', 'prompts', 'v1');
}

function assertPromptBundle(raw: unknown, expectedId: AiPromptIdV1): PromptBundle {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(`Invalid prompt JSON for "${expectedId}": expected object`);
  }
  const o = raw as Record<string, unknown>;
  for (const key of ['version', 'purpose', 'reviewNote', 'system', 'user_template'] as const) {
    if (typeof o[key] !== 'string' || String(o[key]).length === 0) {
      throw new Error(`Invalid prompt JSON for "${expectedId}": missing string field "${key}"`);
    }
  }
  if (o['purpose'] !== expectedId) {
    throw new Error(
      `Invalid prompt JSON for "${expectedId}": purpose field "${String(o['purpose'])}" mismatch`,
    );
  }
  return {
    version: o['version'] as string,
    purpose: o['purpose'] as string,
    reviewNote: o['reviewNote'] as string,
    system: o['system'] as string,
    user_template: o['user_template'] as string,
  };
}

/**
 * Lazy Node-only load of a bundled prompt JSON.
 * Filename is taken only from the closed ID map (no caller path input).
 */
function loadPromptBundleLazy(id: AiPromptIdV1): PromptBundle {
  const hit = cache.get(id);
  if (hit) {
    return hit;
  }

  // Require inside function so importing this module does not execute template I/O.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { readFileSync } = require('node:fs') as typeof import('node:fs');

  const fileName = `${id}.json`;
  const filePath = join(promptsDir(), fileName);
  let rawText: string;
  try {
    rawText = readFileSync(filePath, 'utf8');
  } catch {
    throw new Error(`Unable to load prompt bundle "${id}" from local prompts/v1`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText) as unknown;
  } catch {
    throw new Error(`Prompt bundle "${id}" is not valid JSON`);
  }

  const bundle = assertPromptBundle(parsed, id);
  cache.set(id, bundle);
  return bundle;
}

/**
 * Load a versioned, SME-reviewable prompt bundle by closed ID.
 * Unknown IDs fail closed (no silent default fallback).
 */
export function getPromptBundleV1(purpose: string): PromptBundle {
  if (!isAiPromptIdV1(purpose)) {
    throw new Error(
      `Unknown prompt ID "${purpose}". Allowed: ${AI_PROMPT_IDS_V1.join(', ')}`,
    );
  }
  return loadPromptBundleLazy(purpose);
}

function collectPlaceholders(template: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  PLACEHOLDER_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = PLACEHOLDER_RE.exec(template)) !== null) {
    const key = match[1];
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    found.push(key);
  }
  return found;
}

function toPlainString(value: unknown, key: string): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    throw new Error(`Missing required template variable "${key}"`);
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  throw new Error(
    `Template variable "${key}" must be a string (or number/boolean); objects are not accepted`,
  );
}

export type FillTemplateOptions = {
  /** Explicit allowlist; defaults to placeholders discovered in the template. */
  readonly allowedPlaceholders?: readonly string[];
};

/**
 * Interpolate `{{placeholders}}` into a plain-text prompt template.
 * Fail-closed: no triple braces, unknown placeholders, missing values, or leftovers.
 * Extra keys in `vars` are ignored. Not for HTML/email (no HTML escaping).
 */
export function fillTemplate(
  template: string,
  vars: Record<string, string>,
  options?: FillTemplateOptions,
): string {
  if (TRIPLE_BRACE_RE.test(template)) {
    throw new Error('Triple-brace / SafeString-style placeholders are not allowed');
  }

  const placeholders = collectPlaceholders(template);
  const allowed = options?.allowedPlaceholders
    ? new Set(options.allowedPlaceholders)
    : new Set(placeholders);

  if (options?.allowedPlaceholders) {
    for (const key of placeholders) {
      if (!allowed.has(key)) {
        throw new Error(
          `Unknown template placeholder "{{${key}}}". Allowed: ${[...allowed].sort().join(', ')}`,
        );
      }
    }
  }

  for (const key of placeholders) {
    if (!(key in vars)) {
      throw new Error(`Missing required template variable "${key}"`);
    }
  }

  let out = template;
  for (const key of placeholders) {
    const value = toPlainString(vars[key], key);
    out = out.split(`{{${key}}}`).join(value);
  }

  if (LEFTOVER_RE.test(out)) {
    throw new Error('Unresolved template placeholders remain after interpolation');
  }

  return out;
}

/**
 * Fill the user_template for a known prompt ID using that prompt's placeholder allowlist.
 */
export function fillPromptUserTemplateV1(
  purpose: string,
  vars: Record<string, string>,
): string {
  if (!isAiPromptIdV1(purpose)) {
    throw new Error(
      `Unknown prompt ID "${purpose}". Allowed: ${AI_PROMPT_IDS_V1.join(', ')}`,
    );
  }
  const bundle = loadPromptBundleLazy(purpose);
  return fillTemplate(bundle.user_template, vars, {
    allowedPlaceholders: AI_PROMPT_PLACEHOLDERS_V1[purpose],
  });
}
