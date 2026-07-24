import { join } from 'node:path';

import type { NotificationEventKey } from './event-keys';
import { escapeHtmlText } from './escape';
import {
  NOTIFICATION_SUPPORTED_LOCALES,
  resolveNotificationSubject,
  type NotificationLocale,
  type SubjectResolution,
} from './subjects';

export type { NotificationLocale, SubjectResolution };
export { NOTIFICATION_SUPPORTED_LOCALES, resolveNotificationSubject };

/** Allowlisted MJML body placeholders (must match deferred template shells). */
export const MJML_TEMPLATE_VAR_KEYS = ['heading', 'bodyText', 'footer'] as const;
export type MjmlTemplateVarKey = (typeof MJML_TEMPLATE_VAR_KEYS)[number];
export type MjmlTemplateVars = Record<MjmlTemplateVarKey, string>;

const ALLOWED_VAR_SET: ReadonlySet<string> = new Set(MJML_TEMPLATE_VAR_KEYS);

export type BundledEmailTemplate = {
  /** Raw MJML shell (placeholders not yet interpolated). */
  readonly mjml: string;
  /** Plain-text subject (sanitized). */
  readonly subjectTemplate: string;
  readonly requestedLocale: string;
  readonly resolvedLocale: NotificationLocale;
  readonly usedFallback: boolean;
  readonly fallbackFrom: NotificationLocale | null;
  readonly subjectLocalized: boolean;
  /** @deprecated Prefer resolvedLocale — retained for transitional callers. */
  readonly locale: string;
  readonly mjmlRequestedLocale: string;
  readonly mjmlResolvedLocale: NotificationLocale;
  readonly mjmlUsedFallback: boolean;
};

/**
 * Interpolate allowlisted variables into an MJML/HTML text template.
 * Values are HTML-escaped. Unknown keys are rejected. Missing allowlisted keys are rejected.
 * Does not accept raw HTML passthrough.
 */
export function interpolateMjmlAllowlisted(
  template: string,
  vars: Record<string, string>,
): string {
  const provided = Object.keys(vars);
  const unknown = provided.filter((k) => !ALLOWED_VAR_SET.has(k));
  if (unknown.length > 0) {
    throw new Error(
      `Unknown template variable(s): ${unknown.sort().join(', ')}. Allowed: ${MJML_TEMPLATE_VAR_KEYS.join(', ')}`,
    );
  }

  const missing = MJML_TEMPLATE_VAR_KEYS.filter((k) => !(k in vars));
  if (missing.length > 0) {
    throw new Error(`Missing required template variable(s): ${missing.join(', ')}`);
  }

  let out = template;
  for (const key of MJML_TEMPLATE_VAR_KEYS) {
    const escaped = escapeHtmlText(vars[key] ?? '');
    out = out.split(`{{${key}}}`).join(escaped);
  }

  if (/\{\{[a-zA-Z0-9_]+\}\}/.test(out)) {
    throw new Error('Unresolved template placeholders remain after allowlisted interpolation');
  }

  return out;
}

/** @deprecated Removed unsafe API — use interpolateMjmlAllowlisted. */
export function interpolate(_template: string, _vars: Record<string, string>): never {
  throw new Error(
    'interpolate() was removed as unsafe. Use interpolateMjmlAllowlisted() with allowlisted, HTML-escaped variables.',
  );
}

function isSupportedLocale(locale: string): locale is NotificationLocale {
  return (NOTIFICATION_SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

function normalizeLocale(locale: string): NotificationLocale | null {
  const tag = String(locale).trim().toLowerCase().slice(0, 2);
  return isSupportedLocale(tag) ? tag : null;
}

/**
 * Lazy Node-only MJML file load. No fs read at module import time.
 * Templates under packages/notification-templates/templates remain deferred for import waves;
 * this loader only reads them when explicitly invoked in Node.
 */
function readMjmlPreferEvent(
  eventKey: string,
  requestedLocale: string,
): { mjml: string; mjmlResolvedLocale: NotificationLocale; mjmlUsedFallback: boolean } {
  // Require inside function so importing interpolate helpers does not execute template I/O.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { readFileSync } = require('node:fs') as typeof import('node:fs');

  const templatesRoot = join(__dirname, '..', 'templates', 'standard', 'v1');
  const eventTemplatesRoot = join(__dirname, '..', 'templates', 'events');
  const preferred = normalizeLocale(requestedLocale) ?? 'en';

  const tryRead = (filePath: string): string | null => {
    try {
      return readFileSync(filePath, 'utf8');
    } catch {
      return null;
    }
  };

  const eventPreferred = tryRead(join(eventTemplatesRoot, eventKey, 'v1', `${preferred}.mjml`));
  if (eventPreferred !== null) {
    return {
      mjml: eventPreferred,
      mjmlResolvedLocale: preferred,
      mjmlUsedFallback: false,
    };
  }

  if (preferred !== 'en') {
    const eventEn = tryRead(join(eventTemplatesRoot, eventKey, 'v1', 'en.mjml'));
    if (eventEn !== null) {
      return { mjml: eventEn, mjmlResolvedLocale: 'en', mjmlUsedFallback: true };
    }
  }

  const standardPreferred = tryRead(join(templatesRoot, `${preferred}.mjml`));
  if (standardPreferred !== null) {
    // Event-specific MJML missing — standard shell is an explicit fallback path.
    return {
      mjml: standardPreferred,
      mjmlResolvedLocale: preferred,
      mjmlUsedFallback: true,
    };
  }

  const standardEn = tryRead(join(templatesRoot, 'en.mjml'));
  if (standardEn === null) {
    throw new Error(
      `Unable to load MJML template for event "${eventKey}" (requested locale "${requestedLocale}")`,
    );
  }

  return { mjml: standardEn, mjmlResolvedLocale: 'en', mjmlUsedFallback: true };
}

/**
 * Load bundled MJML shell + auditable subject resolution.
 * Does not send email, choose recipients, route tenants, or make certification decisions.
 * File-system access is lazy (on call only) and Node-only.
 */
export function loadBundledEmailTemplate(
  eventKey: NotificationEventKey,
  locale: string,
): BundledEmailTemplate {
  const subject = resolveNotificationSubject(eventKey, locale);
  const loaded = readMjmlPreferEvent(eventKey, locale);

  return {
    mjml: loaded.mjml,
    subjectTemplate: subject.subject,
    requestedLocale: locale,
    resolvedLocale: subject.resolvedLocale,
    usedFallback: subject.usedFallback,
    fallbackFrom: subject.fallbackFrom,
    subjectLocalized: subject.subjectLocalized,
    locale: subject.resolvedLocale,
    mjmlRequestedLocale: locale,
    mjmlResolvedLocale: loaded.mjmlResolvedLocale,
    mjmlUsedFallback: loaded.mjmlUsedFallback,
  };
}
