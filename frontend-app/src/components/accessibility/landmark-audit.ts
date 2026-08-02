/** Shared landmark checks (WCAG 1.3.1, 2.4.1) for dev warnings and Playwright. */

const SECTIONING_TAGS = new Set(["MAIN", "ARTICLE", "ASIDE", "NAV", "SECTION"]);
const NESTING_ROLES = new Set(["main", "navigation", "banner", "contentinfo", "region"]);

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

export type LandmarkAuditIssue = {
  readonly code: string;
  readonly message: string;
  readonly count?: number;
};

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
