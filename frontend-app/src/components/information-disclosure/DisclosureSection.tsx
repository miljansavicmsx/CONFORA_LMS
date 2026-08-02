import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { disclosureLevelLabelHr, type DisclosureLevel } from "@/lib/information-architecture";

export type DisclosureSectionProps = {
  readonly level: DisclosureLevel;
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly className?: string;
};

/** Keyboard-first `<details>`; summary je fokusabilan i ima vidljivi prsten. */
export function DisclosureSection({ level, children, defaultOpen = false, className }: DisclosureSectionProps): ReactNode {
  const label = disclosureLevelLabelHr[level];
  return (
    <details
      className={cn("rounded-xl border border-border/40 bg-surface-secondary/20 motion-reduce:transition-none", className)}
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold text-text-primary outline-none marker:content-none focus-visible:ring-2 focus-visible:ring-brand [&::-webkit-details-marker]:hidden">
        {label}
        <span className="sr-only"> — proširi ili sažmi odjeljak</span>
      </summary>
      <div className="border-t border-border/30 px-3 py-3 text-sm text-text-secondary">{children}</div>
    </details>
  );
}
