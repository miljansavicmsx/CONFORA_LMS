import { useEffect, type JSX } from "react";
import { useLocation } from "react-router";

import { auditPageLandmarks } from "@/components/accessibility/landmark-audit";

const WARN_PREFIX = "[CONFORA a11y landmarks]";

/**
 * Logs duplicate landmark warnings in development (React Strict Mode may double-invoke).
 */
export function LandmarkDevAudit(): JSX.Element | null {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

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
