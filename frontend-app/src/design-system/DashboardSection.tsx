import type { JSX, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ds } from "./tokens";

export type DashboardSectionProps = {
  readonly id?: string;
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
};

export function DashboardSection({
  id,
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: DashboardSectionProps): JSX.Element {
  const titleId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      className={cn("space-y-4", className)}
      role="region"
      aria-labelledby={titleId}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className={ds.sectionEyebrow}>{eyebrow}</p> : null}
          <h2 id={titleId} className={cn(ds.sectionTitle, eyebrow && "mt-1")}>
            {title}
          </h2>
          {description ? <p className="mt-1 max-w-3xl text-sm text-text-secondary">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
