import {
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@confora/i18n";

const ENV_LOCALE = import.meta.env.VITE_APP_LOCALE as SupportedLocale | undefined;

/**
 * Unset UI locale follows OD-PP NFR-07 and Baseline §14: bs, then en.
 * A saved choice and VITE_APP_LOCALE still win.
 */
const DEFAULT_UI_LOCALE: SupportedLocale = "bs";

function isSupportedLocale(value: string | null | undefined): value is SupportedLocale {
  return Boolean(value && (SUPPORTED_LOCALES as readonly string[]).includes(value));
}

/** Resolve initial UI locale — display only; does not affect auth or API. */
export function resolveInitialUiLocale(): SupportedLocale {
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isSupportedLocale(stored)) {
        return stored;
      }
    } catch {
      /* private browsing / blocked storage */
    }
  }
  if (isSupportedLocale(ENV_LOCALE)) {
    return ENV_LOCALE;
  }
  return DEFAULT_UI_LOCALE;
}

/** Persist UI locale choice (no auth/token impact). */
export function persistUiLocale(locale: SupportedLocale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

export function readPersistedUiLocale(): SupportedLocale | null {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isSupportedLocale(stored) ? stored : null;
  } catch {
    return null;
  }
}
