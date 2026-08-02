import type { JSX, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function WorkflowBadge({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border/50 bg-surface-tertiary/50 px-2 py-0.5 text-[11px] font-medium text-text-secondary",
        className,
      )}
    >
      {children}
    </span>
  );
}
