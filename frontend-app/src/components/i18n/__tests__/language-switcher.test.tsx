import { fireEvent, render, screen } from "@testing-library/react";
import { AUTH_NS, LOCALE_STORAGE_KEY, createConforaI18n } from "@confora/i18n";
import type { ReactElement } from "react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";

import { LanguageSwitcher } from "../LanguageSwitcher";

function renderWithI18n(ui: ReactElement, lng = "en") {
  const i18n = createConforaI18n({ lng, fallbackLng: "en" });
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

describe("LanguageSwitcher", () => {
  it("renders accessible language select", () => {
    renderWithI18n(<LanguageSwitcher />);
    expect(screen.getByTestId("language-switcher-select")).toBeTruthy();
    expect(screen.getByLabelText(/language/i)).toBeTruthy();
  });

  it("persists selection and changes login copy", () => {
    localStorage.removeItem(LOCALE_STORAGE_KEY);
    const i18n = createConforaI18n({ lng: "hr", fallbackLng: "en" });
    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher data-testid="test-lang" />
        <span data-testid="login-title">{i18n.t(`${AUTH_NS}:login.title`)}</span>
      </I18nextProvider>,
    );

    expect(screen.getByTestId("login-title").textContent?.toLowerCase()).toContain("prijava");

    fireEvent.change(screen.getByTestId("test-lang-select"), { target: { value: "en" } });
    rerender(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher data-testid="test-lang" />
        <span data-testid="login-title">{i18n.t(`${AUTH_NS}:login.title`)}</span>
      </I18nextProvider>,
    );

    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("en");
    expect(i18n.language).toBe("en");
    expect(screen.getByTestId("login-title").textContent?.toLowerCase()).toContain("sign in");
  });
});
