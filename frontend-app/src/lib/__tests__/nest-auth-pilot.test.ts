import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildNestAuthPilotMobileNav,
  buildNestAuthPilotSidebarSections,
  isNestAuthPilotActive,
  isNestAuthPilotConfigured,
  isPilotDashboardPathAllowed,
  NEST_AUTH_PILOT_BLOCKED_DASHBOARD_PREFIXES,
  NEST_AUTH_PILOT_LEARNER_DASHBOARD_PREFIXES,
  NEST_AUTH_PILOT_STAFF_DASHBOARD_PREFIXES,
  parseNestAuthPilotEnabled,
  resolvePilotNavPersona,
  shouldRedirectPilotDashboardPath,
  warnNestAuthPilotMisconfiguration,
} from "../nest-auth-pilot";

describe("nest-auth-pilot flags", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_NEST_AUTH_PILOT_ENABLED", "false");
    vi.stubEnv("VITE_AUTH_PROVIDER", "legacy");
    vi.stubEnv("VITE_API_PROVIDER", "hybrid");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("parseNestAuthPilotEnabled defaults to false", () => {
    expect(parseNestAuthPilotEnabled(undefined)).toBe(false);
    expect(parseNestAuthPilotEnabled("true")).toBe(true);
    expect(parseNestAuthPilotEnabled("1")).toBe(true);
  });

  it("pilot is inactive when flag false", () => {
    expect(isNestAuthPilotConfigured()).toBe(false);
    expect(isNestAuthPilotActive()).toBe(false);
  });

  it("pilot flag true without nest auth provider does not activate pilot", () => {
    vi.stubEnv("VITE_NEST_AUTH_PILOT_ENABLED", "true");
    vi.stubEnv("VITE_AUTH_PROVIDER", "legacy");
    expect(isNestAuthPilotConfigured()).toBe(true);
    expect(isNestAuthPilotActive()).toBe(false);
  });

  it("pilot active only when flag true and VITE_AUTH_PROVIDER=nest", () => {
    vi.stubEnv("VITE_NEST_AUTH_PILOT_ENABLED", "true");
    vi.stubEnv("VITE_AUTH_PROVIDER", "nest");
    expect(isNestAuthPilotActive()).toBe(true);
  });

  it("warns when pilot configured without nest auth provider", () => {
    vi.stubEnv("VITE_NEST_AUTH_PILOT_ENABLED", "true");
    vi.stubEnv("VITE_AUTH_PROVIDER", "legacy");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    warnNestAuthPilotMisconfiguration();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("VITE_NEST_AUTH_PILOT_ENABLED"));
    warnSpy.mockRestore();
  });
});

describe("nest-auth-pilot route whitelist", () => {
  it("allows pilot dashboard paths", () => {
    expect(isPilotDashboardPathAllowed("/dashboard")).toBe(true);
    expect(isPilotDashboardPathAllowed("/dashboard/profil")).toBe(true);
    expect(isPilotDashboardPathAllowed("/dashboard/postavke")).toBe(true);
    expect(isPilotDashboardPathAllowed("/dashboard/me/accommodations")).toBe(true);
    for (const prefix of NEST_AUTH_PILOT_LEARNER_DASHBOARD_PREFIXES) {
      expect(isPilotDashboardPathAllowed(prefix)).toBe(true);
      expect(isPilotDashboardPathAllowed(`${prefix}/detail`)).toBe(true);
    }
    expect(isPilotDashboardPathAllowed("/dashboard/learner/education")).toBe(true);
    expect(isPilotDashboardPathAllowed("/dashboard/exams/register")).toBe(true);
    expect(isPilotDashboardPathAllowed("/dashboard/certification/applications")).toBe(true);
    expect(isPilotDashboardPathAllowed("/dashboard/my-certificates")).toBe(true);
    expect(isPilotDashboardPathAllowed("/dashboard/my-recertifications")).toBe(true);
    expect(isPilotDashboardPathAllowed("/dashboard/support")).toBe(true);
  });

  it("redirects excluded dashboard paths during pilot", () => {
    for (const prefix of NEST_AUTH_PILOT_BLOCKED_DASHBOARD_PREFIXES) {
      expect(shouldRedirectPilotDashboardPath(prefix)).toBe(true);
      expect(shouldRedirectPilotDashboardPath(`${prefix}/detail`)).toBe(true);
    }
    expect(shouldRedirectPilotDashboardPath("/dashboard/certification")).toBe(true);
    expect(shouldRedirectPilotDashboardPath("/dashboard/certification/status")).toBe(true);
    expect(shouldRedirectPilotDashboardPath("/dashboard/iso/governance")).toBe(true);
    expect(shouldRedirectPilotDashboardPath("/dashboard/finance")).toBe(true);
    expect(shouldRedirectPilotDashboardPath("/dashboard/admin/users")).toBe(true);
  });

  it("does not redirect learner acceptance dashboard paths", () => {
    expect(shouldRedirectPilotDashboardPath("/dashboard/exams/register")).toBe(false);
    expect(shouldRedirectPilotDashboardPath("/dashboard/certification/applications")).toBe(false);
    expect(shouldRedirectPilotDashboardPath("/dashboard/learner/education")).toBe(false);
    expect(shouldRedirectPilotDashboardPath("/dashboard/my-recertifications")).toBe(false);
  });

  it("does not redirect staff governance dashboard paths during pilot", () => {
    for (const prefix of NEST_AUTH_PILOT_STAFF_DASHBOARD_PREFIXES) {
      expect(shouldRedirectPilotDashboardPath(prefix)).toBe(false);
      expect(shouldRedirectPilotDashboardPath(`${prefix}/detail`)).toBe(false);
    }
    expect(shouldRedirectPilotDashboardPath("/dashboard/admin/reports")).toBe(false);
    expect(shouldRedirectPilotDashboardPath("/dashboard/admin/education")).toBe(false);
    expect(shouldRedirectPilotDashboardPath("/dashboard/iso/reports")).toBe(false);
  });

  it("resolvePilotNavPersona maps STAFF_TRAINADM to training_admin", () => {
    expect(
      resolvePilotNavPersona({ roleFromProfile: "learner", jwtRoles: ["STAFF_TRAINADM"] }),
    ).toBe("training_admin");
  });

  it("does not redirect non-dashboard paths", () => {
    expect(shouldRedirectPilotDashboardPath("/courses")).toBe(false);
    expect(shouldRedirectPilotDashboardPath("/contact")).toBe(false);
  });

  it("pilot sidebar includes learner acceptance links", () => {
    const sections = buildNestAuthPilotSidebarSections();
    const paths = sections.flatMap((s) => s.items.map((i) => i.to));
    expect(paths).toContain("/dashboard");
    expect(paths).toContain("/dashboard/learner/education");
    expect(paths).toContain("/courses");
    expect(paths).toContain("/dashboard/exams/register");
    expect(paths).toContain("/dashboard/certification/applications");
    expect(paths).toContain("/dashboard/my-certificates");
    expect(paths).toContain("/dashboard/support");
    expect(paths.some((p) => p.includes("/dashboard/admin"))).toBe(false);
  });

  it("pilot mobile nav includes learner acceptance links", () => {
    const mobile = buildNestAuthPilotMobileNav();
    expect(mobile.map((i) => i.to)).toEqual([
      "/dashboard",
      "/dashboard/learner/education",
      "/courses",
      "/dashboard/certification/applications",
      "/dashboard/support",
    ]);
  });
});
