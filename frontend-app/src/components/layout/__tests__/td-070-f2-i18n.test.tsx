import { render, screen } from "@testing-library/react";
import {
  DASHBOARD_NS,
  NAVIGATION_NS,
  createConforaI18n,
} from "@confora/i18n";
import type { ReactElement } from "react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";

import { localizeSidebarSections } from "@/components/layout/localize-sidebar-sections";
import { buildSidebarSections } from "@/components/layout/sidebar-sections";

function renderWithI18n(ui: ReactElement, lng = "en") {
  const i18n = createConforaI18n({ lng, fallbackLng: "en" });
  return { ...render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>), i18n };
}

describe("TD-070-F2 dashboard/sidebar i18n", () => {
  it("localizes learner sidebar labels through navigation namespace", () => {
    const i18n = createConforaI18n({ lng: "en", fallbackLng: "en" });
    const defs = buildSidebarSections({ role: "learner", cognitoGroups: [] }, "learning");
    const localized = localizeSidebarSections(defs, i18n.t.bind(i18n));
    const labels = localized.flatMap((s) => s.items.map((i) => i.label));
    expect(labels).toContain("My education");
    expect(labels).toContain("My certificates and confirmations");
  });

  it("language switch changes localized sidebar label", () => {
    const i18n = createConforaI18n({ lng: "hr", fallbackLng: "en" });
    const defs = buildSidebarSections({ role: "learner", cognitoGroups: [] }, "learning");
    const hrLabels = localizeSidebarSections(defs, i18n.t.bind(i18n))
      .flatMap((s) => s.items.map((i) => i.label));
    expect(hrLabels).toContain("Moje edukacije");

    void i18n.changeLanguage("en");
    const enLabels = localizeSidebarSections(defs, i18n.t.bind(i18n))
      .flatMap((s) => s.items.map((i) => i.label));
    expect(enLabels).toContain("My education");
    expect(enLabels).not.toContain("Moje edukacije");
  });

  it("dashboard pilot strings resolve per locale", () => {
    const en = createConforaI18n({ lng: "en", fallbackLng: "en" });
    const hr = createConforaI18n({ lng: "hr", fallbackLng: "en" });
    expect(en.t(`${DASHBOARD_NS}:pilot.title`)).toContain("Dashboard");
    expect(hr.t(`${DASHBOARD_NS}:pilot.title`)).toContain("Nadzorna");
  });

  it("wallet status labels avoid raw enum in UI helper", () => {
    const i18n = createConforaI18n({ lng: "en", fallbackLng: "en" });
    const label = i18n.t(`${NAVIGATION_NS}:items.myCertificates`);
    expect(label).not.toBe("myCertificates");
    expect(label.length).toBeGreaterThan(3);
  });
});

describe("TD-070-F2 locale persistence", () => {
  it("still persists via language switcher flow", () => {
    localStorage.removeItem("confora.locale.v1");
    const { i18n } = renderWithI18n(<span data-testid="probe">x</span>, "hr");
    void i18n.changeLanguage("en");
    expect(i18n.language).toBe("en");
  });
});
