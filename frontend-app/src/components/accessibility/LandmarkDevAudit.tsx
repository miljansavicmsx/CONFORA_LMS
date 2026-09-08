import { useEffect, type JSX } from "react";
import { useLocation } from "react-router";

const WARN_PREFIX = "[CONFORA a11y landmarks]";

const SECTIONING_TAGS = new Set(["MAIN", "ARTICLE", "ASIDE", "NAV", "SECTION"]);
const NESTING_ROLES = new Set(["main", "navigation", "banner", "contentinfo", "region"]);

type LandmarkAuditIssue = {
  readonly code: string;
  readonly message: string;
  readonly count?: number;
};

function isInsideSectioningLandmark(el: Element): boolean {
  let parent = el.parentElement;
  while (parent && parent !== document.body) {
    const tag = parent.tagName;
    const role = parent.getAttribute("role");
    if (SECTIONING_TAGS.has(tag) || (role !== null && NESTING_ROLES.has(role))) {
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
}

/** WCAG 1.3.1 / 2.4.1 landmark checks for DEV warnings (self-contained for MD01 path). */
export function auditPageLandmarks(doc: Document = document): readonly LandmarkAuditIssue[] {
  const issues: LandmarkAuditIssue[] = [];

  const mains = [...doc.querySelectorAll("main")];
  const mainContent = mains.filter((m) => m.id === "main-content");
  if (mainContent.length !== 1) {
    issues.push({
      code: "main-content-count",
      message: `Expected exactly one <main id="main-content">, found ${mainContent.length} (total <main>: ${mains.length}).`,
      count: mainContent.length,
    });
  } else if (mains.length > 1) {
    issues.push({
      code: "duplicate-main",
      message: `Found ${mains.length} <main> elements; nested routes should use <section aria-labelledby> instead.`,
      count: mains.length,
    });
  }

  const topBanners = [
    ...doc.querySelectorAll('[role="banner"]'),
    ...[...doc.querySelectorAll("header")].filter((h) => {
      const role = h.getAttribute("role");
      return role !== "presentation" && role !== "none";
    }),
  ].filter((el, idx, all) => all.indexOf(el) === idx && !isInsideSectioningLandmark(el));

  if (topBanners.length > 1) {
    issues.push({
      code: "duplicate-banner",
      message: `At most one top-level banner landmark allowed, found ${topBanners.length}.`,
      count: topBanners.length,
    });
  }

  const topFooters = [
    ...doc.querySelectorAll('[role="contentinfo"]'),
    ...[...doc.querySelectorAll("footer")].filter((f) => {
      const role = f.getAttribute("role");
      return role !== "presentation" && role !== "none";
    }),
  ].filter((el, idx, all) => all.indexOf(el) === idx && !isInsideSectioningLandmark(el));

  if (topFooters.length > 1) {
    issues.push({
      code: "duplicate-contentinfo",
      message: `At most one top-level contentinfo landmark allowed, found ${topFooters.length}.`,
      count: topFooters.length,
    });
  }

  const unlabeledNavs = [...doc.querySelectorAll("nav")].filter((nav) => {
    const label = nav.getAttribute("aria-label")?.trim();
    const labelledBy = nav.getAttribute("aria-labelledby")?.trim();
    return !label && !labelledBy;
  });

  if (unlabeledNavs.length > 0) {
    issues.push({
      code: "nav-missing-label",
      message: `${unlabeledNavs.length} <nav> element(s) missing aria-label or aria-labelledby.`,
      count: unlabeledNavs.length,
    });
  }

  return issues;
}

/**
 * DEV-only landmark audit mounted by App.tsx under import.meta.env.DEV.
 * Returns null (no production DOM); logs duplicate/missing landmark warnings.
 */
export function LandmarkDevAudit(): JSX.Element | null {
  const { pathname } = useLocation();

  // DEV-only mounting is enforced by App.tsx (`import.meta.env.DEV ? <LandmarkDevAudit /> : null`).
  // Avoid import.meta.env here to prevent a new ImportMeta diagnostic on this residual path.
  useEffect(() => {
    const run = (): void => {
      const issues = auditPageLandmarks();
      if (issues.length === 0) {
        return;
      }
      for (const issue of issues) {
        console.warn(`${WARN_PREFIX} ${issue.message}`, { path: pathname, code: issue.code });
      }
    };

    const id = window.requestAnimationFrame(() => {
      run();
    });

    return () => {
      window.cancelAnimationFrame(id);
    };
  }, [pathname]);

  return null;
}
