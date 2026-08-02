import { createElement, type JSX, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ds } from "./tokens";

/** Zaglavlje sekcije (bez regije — obavijestite `DashboardSection` ako treba `role="region"`). */
export function EnterpriseSectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
  titleLevel = "h2",
}: {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: ReactNode;
  readonly action?: ReactNode;
  readonly className?: string;
  readonly titleLevel?: "h2" | "h3";
}): JSX.Element {
  const tag = titleLevel === "h3" ? "h3" : "h2";

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className={ds.sectionEyebrowMuted}>{eyebrow}</p> : null}
        {createElement(
          tag,
          { className: cn(ds.sectionTitle, eyebrow ? "mt-1" : undefined) },
          title,
        )}
        {description ? <p className="mt-1 max-w-prose text-sm text-text-secondary">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
