/**
 * MOBILE-NAV-1 — Mobile navigation helpers, disclaimer hooks and field guards.
 */
import {
  INACTIVE_PILOT_NAV_PATH_PREFIXES,
  isInactivePilotNavPath,
} from "@/lib/inactive-feature-visibility";
import {
  buildRoleAwarePilotMobileNav,
  type PilotNavContext,
  resolvePilotNavPersona,
} from "@/lib/nest-auth-pilot";
import {
  isSupportProhibitedFieldName,
  SUPPORT_PROHIBITED_FIELD_NAMES,
} from "@/lib/support-contact-labels";

export { INACTIVE_PILOT_NAV_PATH_PREFIXES, isInactivePilotNavPath };
export { SUPPORT_PROHIBITED_FIELD_NAMES, isSupportProhibitedFieldName };

export const MOBILE_NAV_DISCLAIMER_TEST_IDS = {
  catalog: "catalog-cert-disclaimer",
  boundary: "learner-education-cert-boundary",
} as const;

export const MOBILE_NAV_SHELL_TEST_IDS = {
  drawer: "mobile-nav-drawer",
  bottomNav: "mobile-bottom-nav",
  menuOpen: "mobile-menu-open",
  menuClose: "mobile-menu-close",
} as const;

const STAFF_MOBILE_PATH_PREFIXES = [
  "/dashboard/admin",
  "/dashboard/iso",
] as const;

/** Paths returned for a pilot persona in mobile bottom nav. */
export function mobileNavPathsForPersona(navCtx: PilotNavContext): readonly string[] {
  return buildRoleAwarePilotMobileNav(navCtx).map((item) => item.to);
}

/** Mobile nav must not surface inactive/deferred pilot routes. */
export function mobileNavExcludesInactivePaths(navCtx: PilotNavContext): boolean {
  return mobileNavPathsForPersona(navCtx).every((path) => !isInactivePilotNavPath(path));
}

/** Learner mobile nav must not include staff/admin/iso workspace paths. */
export function learnerMobileNavExcludesStaffPaths(navCtx: PilotNavContext = {}): boolean {
  const persona = resolvePilotNavPersona({ ...navCtx, roleFromProfile: navCtx.roleFromProfile ?? "learner" });
  if (persona !== "learner") {
    return false;
  }
  return !mobileNavPathsForPersona(navCtx).some((path) =>
    STAFF_MOBILE_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)),
  );
}

/** Director mobile nav should not include certification finalize routes as primary tabs. */
export function directorMobileNavIsOversightOnly(navCtx: PilotNavContext): boolean {
  const persona = resolvePilotNavPersona(navCtx);
  if (persona !== "director") {
    return false;
  }
  const paths = mobileNavPathsForPersona(navCtx);
  return paths.some((p) => p.includes("/dashboard/admin/reports")) && !paths.includes("/dashboard/iso/applications");
}

declare global {
  interface Window {
    __MOBILE_NAV_E2E__?: boolean;
  }
}

/** Playwright-only marker for mobile-nav slice. */
export function isMobileNavE2eMode(): boolean {
  return typeof window !== "undefined" && window.__MOBILE_NAV_E2E__ === true;
}
