import { describe, expect, it } from "vitest";

import {
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  createConforaI18n,
} from "@confora/i18n";

import {
  persistUiLocale,
  readPersistedUiLocale,
  resolveInitialUiLocale,
} from "../locale-preference";

describe("locale-preference", () => {
  it("defaults to hr when storage and env unset", () => {
    localStorage.removeItem(LOCALE_STORAGE_KEY);
    expect(resolveInitialUiLocale()).toBe("hr");
  });

  it("reads persisted locale from localStorage", () => {
    persistUiLocale("en");
    expect(readPersistedUiLocale()).toBe("en");
    expect(resolveInitialUiLocale()).toBe("en");
    localStorage.removeItem(LOCALE_STORAGE_KEY);
  });

  it("supports all five UI locales", () => {
    expect(SUPPORTED_LOCALES).toEqual(["en", "bs", "sr", "hr", "sl"]);
    for (const locale of SUPPORTED_LOCALES) {
      const i18n = createConforaI18n({ lng: locale, fallbackLng: "en" });
      expect(i18n.t("shell:language.label")).not.toBe("shell:language.label");
    }
  });
});
