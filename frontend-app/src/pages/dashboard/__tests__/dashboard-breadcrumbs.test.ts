import { describe, expect, it } from "vitest";

import { breadcrumbsFromPathname } from "@/pages/dashboard/dashboard-breadcrumbs";

describe("dashboard breadcrumbs (UI-SHELL-1C)", () => {
  it("uses clearer labels for learner education", () => {
    const items = breadcrumbsFromPathname("/dashboard/learner/education");
    expect(items.some((i) => i.label === "Moje edukacije")).toBe(true);
    expect(items.some((i) => i.label === "Home")).toBe(false);
  });

  it("uses admin education management label", () => {
    const items = breadcrumbsFromPathname("/dashboard/admin/education");
    expect(items.some((i) => i.label === "Upravljanje edukacijama")).toBe(true);
    expect(items.some((i) => i.label === "Moje edukacije")).toBe(false);
  });

  it("uses Objedinjeni izvještaji for admin reports", () => {
    const items = breadcrumbsFromPathname("/dashboard/admin/reports");
    expect(items.some((i) => i.label === "Objedinjeni izvještaji")).toBe(true);
  });
  it("uses admin identity-review label", () => {
    const items = breadcrumbsFromPathname("/dashboard/admin/identity-review");
    expect(items.some((i) => i.label === "Ručna provjera identiteta")).toBe(true);
  });

  it("uses ISO certification labels", () => {
    const apps = breadcrumbsFromPathname("/dashboard/iso/applications");
    expect(apps.some((i) => i.label === "Prijave")).toBe(true);
    const decisions = breadcrumbsFromPathname("/dashboard/iso/decisions");
    expect(decisions.some((i) => i.label === "Odluke o certifikaciji")).toBe(true);
  });
});
