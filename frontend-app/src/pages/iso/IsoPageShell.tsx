import type { LucideIcon } from "lucide-react";
import { type JSX, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function IsoPageShell({
  title,
  description,
  icon: Icon,
  children,
  className,
  headingTestId,
}: {
  readonly title: string;
  readonly description?: string;
  readonly icon: LucideIcon;
  readonly children?: ReactNode;
  readonly className?: string;
  readonly headingTestId?: string;
}): JSX.Element {
  return (
    <div className={cn("mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-6", className)}>
      <header className="space-y-2 border-b border-border/40 pb-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/25">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">ISO / IEC 17024</p>
            <h1
              className="text-2xl font-semibold tracking-tight text-text-primary"
              {...(headingTestId ? { "data-testid": headingTestId } : {})}
            >
              {title}
            </h1>
            {description ? <p className="text-sm leading-relaxed text-text-secondary">{description}</p> : null}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
