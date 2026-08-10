import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const APPROVED_ROUTE_PATHS = [
  "/login",
  "/verify",
  "/verify/:verificationHash",
  "/courses",
  "/courses/:courseId",
  "/dashboard",
  "learner/education",
  "exams/register",
  "certification/applications",
  "my-certificates",
  "my-recertifications",
  "support",
  "appeals-complaints",
  "iso/applications",
  "iso/appeals",
  "iso/complaints",
  "iso/reports",
  "admin/education",
  "admin/reports",
  "admin/support",
  "admin/appeals-complaints",
  "admin/identity-review",
  "admin/recertification",
  "committee/pilot-applications",
] as const;

const APPROVED_NAVIGATION_PATHS = new Set([
  "/courses",
  "/dashboard",
  ...APPROVED_ROUTE_PATHS.filter((path) => !path.startsWith("/")).map(
    (path) => `/dashboard/${path}`,
  ),
]);

function source(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

function routePaths(appSource: string): string[] {
  return [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)].map((match) => match[1] ?? "");
}

function navigationPaths(navSource: string): string[] {
  return [...navSource.matchAll(/\bto:\s*"([^"]+)"/g)].map((match) => match[1] ?? "");
}

describe("owner-approved R0-7D minimum bridge contract", () => {
  const app = source("src/App.tsx");
  const sidebar = source("src/components/layout/sidebar-sections.tsx");
  const dashboardLayout = source("src/layouts/DashboardLayout.tsx");
  const pilot = source("src/lib/nest-auth-pilot.ts");

  it("represents every approved route plus bootstrap and accessibility hooks", () => {
    expect(routePaths(app)).toEqual(APPROVED_ROUTE_PATHS);
    expect((app.match(/<Route\s+index\b/g) ?? []).length).toBe(1);
    expect(app).toContain("export default function App");
    expect(app).toContain("<LandmarkDevAudit />");
    expect(app).toContain("<A11ySkipToMainLink />");
    expect(source("vite.config.ts")).toContain('./vite-csp-preview.mjs');
  });

  it("contains no excluded route or shell surface", () => {
    expect(routePaths(app)).toHaveLength(24);
    expect(app).not.toContain("FeedbackWidget");
    expect(app).not.toContain("AppShellFallback");
    expect(app).not.toContain("admin/users");
    expect(app).not.toContain("committee/decisions");
    expect(app).not.toContain("iso/decisions");
  });

  it("contains exactly the approved sidebar navigation occurrences", () => {
    const paths = navigationPaths(sidebar);
    expect(paths).toHaveLength(30);
    expect(paths.every((path) => APPROVED_NAVIGATION_PATHS.has(path))).toBe(true);
  });

  it("removes excluded default mobile navigation", () => {
    const defaultMobileNav = dashboardLayout.slice(
      dashboardLayout.indexOf("const MOBILE_NAV"),
      dashboardLayout.indexOf("function useMediaMinLg"),
    );
    expect(navigationPaths(defaultMobileNav)).toEqual([
      "/dashboard",
      "/dashboard/certification/applications",
    ]);
  });

  it("keeps all advertised pilot navigation on represented routes", () => {
    const advertised = navigationPaths(pilot);
    expect(advertised).not.toContain("/dashboard/admin/users");
    expect(advertised.every((path) => APPROVED_NAVIGATION_PATHS.has(path))).toBe(true);
  });

  it("retains blocked-prefix controls without adding allowed prefixes", () => {
    expect(pilot).toContain("NEST_AUTH_PILOT_BLOCKED_DASHBOARD_PREFIXES");
    expect(pilot).toContain('"/dashboard/admin"');
    expect(pilot).toContain('"/dashboard/committee"');
    expect(pilot).toContain('"/dashboard/iso"');
    expect(pilot).toContain("return !isPilotDashboardPathAllowed(normalized)");
  });
});
