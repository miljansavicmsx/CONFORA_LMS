import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CertificationCatalogDisclaimer } from "@/components/catalog/CertificationCatalogDisclaimer";
import ContactPage from "@/pages/public/ContactPage";
import {
  INACTIVE_PILOT_NAV_PATH_PREFIXES,
  MOBILE_NAV_DISCLAIMER_TEST_IDS,
  SUPPORT_PROHIBITED_FIELD_NAMES,
  directorMobileNavIsOversightOnly,
  isSupportProhibitedFieldName,
  learnerMobileNavExcludesStaffPaths,
  mobileNavExcludesInactivePaths,
  mobileNavPathsForPersona,
} from "@/lib/mobile-nav-labels";

vi.mock("@hcaptcha/react-hcaptcha", () => ({
  default: () => null,
}));

vi.mock("@/stores/authStore", () => ({
  useAuthStore: (sel: (s: { user: null }) => unknown) => sel({ user: null }),
}));

describe("MOBILE-NAV-1 mobile-nav-labels", () => {
  it("mobile nav renders role-aware items per persona", () => {
    const learner = mobileNavPathsForPersona({ roleFromProfile: "learner" });
    const director = mobileNavPathsForPersona({
      roleFromProfile: "director",
      jwtRoles: ["STAFF_DIR"],
    });
    const sysadmin = mobileNavPathsForPersona({
      roleFromProfile: "sysadmin",
      jwtRoles: ["STAFF_SYSADM"],
    });

    expect(learner).toContain("/dashboard/learner/education");
    expect(director).toContain("/dashboard/admin/reports");
    expect(sysadmin).toContain("/dashboard/admin/users");
    expect(learner).not.toEqual(director);
  });

  it("inactive items are hidden from mobile nav paths", () => {
    const personas: Array<{ roleFromProfile: string; jwtRoles?: string[] }> = [
      { roleFromProfile: "learner" },
      { roleFromProfile: "director", jwtRoles: ["STAFF_DIR"] },
      { roleFromProfile: "sysadmin", jwtRoles: ["STAFF_SYSADM"] },
      { roleFromProfile: "training_admin", jwtRoles: ["STAFF_TRAINADM"] },
      { roleFromProfile: "certification_staff", jwtRoles: ["STAFF_COM_CERT"] },
      { roleFromProfile: "id_verifier", jwtRoles: ["STAFF_ID_VERIFIER"] },
    ];

    for (const ctx of personas) {
      expect(mobileNavExcludesInactivePaths(ctx)).toBe(true);
      for (const path of mobileNavPathsForPersona(ctx)) {
        expect(INACTIVE_PILOT_NAV_PATH_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))).toBe(
          false,
        );
      }
    }
  });

  it("learner mobile nav excludes staff/admin routes", () => {
    expect(learnerMobileNavExcludesStaffPaths({ roleFromProfile: "learner" })).toBe(true);
    expect(
      learnerMobileNavExcludesStaffPaths({
        roleFromProfile: "director",
        jwtRoles: ["STAFF_DIR"],
      }),
    ).toBe(false);
  });

  it("director mobile nav is oversight-oriented", () => {
    expect(
      directorMobileNavIsOversightOnly({
        roleFromProfile: "director",
        jwtRoles: ["STAFF_DIR"],
      }),
    ).toBe(true);
  });

  it("D-12 disclaimer remains visible on mobile public pages", () => {
    const source = readFileSync(
      join(process.cwd(), "src/pages/courses/CoursesCatalogPage.tsx"),
      "utf8",
    );
    expect(source).toContain("CertificationCatalogDisclaimer");
    const { getByTestId } = render(<CertificationCatalogDisclaimer />);
    expect(getByTestId(MOBILE_NAV_DISCLAIMER_TEST_IDS.catalog)).toBeTruthy();
  });

  it("learner boundary banner remains wired on education page", () => {
    const source = readFileSync(
      join(process.cwd(), "src/pages/learner/LearnerEducationPage.tsx"),
      "utf8",
    );
    expect(source).toMatch(/LearnerJourneyBoundaryBanner|learner-education-cert-boundary/);
  });

  it("support/contact form has no ID/biometric fields", () => {
    const { container } = render(<ContactPage />);
    expect(container.querySelector('[data-testid="public-support-form"]')).not.toBeNull();
    expect(container.querySelector('input[type="file"]')).toBeNull();
    for (const name of SUPPORT_PROHIBITED_FIELD_NAMES) {
      expect(container.querySelector(`[name="${name}"]`)).toBeNull();
      expect(isSupportProhibitedFieldName(name)).toBe(true);
    }
  });
});
