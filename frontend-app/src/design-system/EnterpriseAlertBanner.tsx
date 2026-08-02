import type { JSX, ReactNode } from "react";
import { cn } from "@/lib/utils";

import { AlertBanner } from "./AlertBanner";
import type { Severity } from "./SeverityBadge";

/** Enterprise omot — dosljedan padding + dodatni status channel za čitače ekrana. */
export function EnterpriseAlertBanner({
  severity,
  icon,
  title,
  children,
  className,
}: {
  readonly severity: Severity;
  readonly icon: Parameters<typeof AlertBanner>[0]["icon"];
  readonly title: string;
  readonly children?: ReactNode;
  readonly className?: string;
}): JSX.Element {
  return (
    <div className={cn("text-left", className)} aria-live="polite">
      <AlertBanner severity={severity} icon={icon} title={title}>
        {children}
      </AlertBanner>
    </div>
  );
}
