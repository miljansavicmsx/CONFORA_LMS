import i18n, { type i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  A11Y_NS,
  AUTH_NS,
  CANDIDATE_PORTAL_NS,
  CERTIFICATION_STAFF_NS,
  COMMON_NS,
  DASHBOARD_NS,
  NAVIGATION_NS,
  SHELL_NS,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from './keys.js';
import { conforaI18nResources } from './resources.js';

export type CreateConforaI18nOptions = {
  readonly lng?: SupportedLocale;
  readonly fallbackLng?: SupportedLocale;
};

function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Creates a dedicated i18next instance preloaded with bundled namespaces.
 * Use one instance per app shell (browser tab / SSR request).
 */
export function createConforaI18n(options: CreateConforaI18nOptions = {}): I18nInstance {
  const fallbackLng = options.fallbackLng ?? 'en';
  const lng = options.lng ?? fallbackLng;

  const instance = i18n.createInstance();
  void instance.use(initReactI18next).init({
    resources: conforaI18nResources,
    lng: isSupportedLocale(lng) ? lng : fallbackLng,
    fallbackLng,
    ns: [
      A11Y_NS,
      CERTIFICATION_STAFF_NS,
      CANDIDATE_PORTAL_NS,
      AUTH_NS,
      SHELL_NS,
      NAVIGATION_NS,
      DASHBOARD_NS,
      COMMON_NS,
    ],
    defaultNS: A11Y_NS,
    interpolation: { escapeValue: false },
  });

  return instance;
}
