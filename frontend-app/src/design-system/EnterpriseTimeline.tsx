import { Lock, PlayCircle, CheckCircle2 } from "lucide-react";
import type { JSX, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ds } from "./tokens";

export type EnterpriseTimelineItemState = "done" | "current" | "locked";

export type EnterpriseTimelineItem = {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly state: EnterpriseTimelineItemState;
  readonly meta?: ReactNode;
};

export function EnterpriseTimeline({
  ariaLabel,
  items,
}: {
  readonly ariaLabel: string;
  readonly items: readonly EnterpriseTimelineItem[];
}): JSX.Element {
  return (
    <nav className={cn(ds.widget, "p-4")} aria-label={ariaLabel}>
      <ol className="space-y-0">
        {items.map((item, index) => {
          const Icon =
            item.state === "done" ? CheckCircle2 : item.state === "current" ? PlayCircle : Lock;
          const line =
            item.state === "done"
              ? "border-emerald-500/35 text-emerald-300"
              : item.state === "current"
                ? "border-brand/40 text-brand"
                : "border-border/50 text-text-muted";
          return (
            <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
              {index < items.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute left-[15px] top-8 h-[calc(100%-0.5rem)] w-px bg-border/55"
                />
              ) : null}
              <span className={cn("relative z-[1] mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-surface-secondary/80", line)}>
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                {item.subtitle ? <p className="mt-0.5 text-xs text-text-muted">{item.subtitle}</p> : null}
                {item.meta ? <div className="mt-2 text-xs text-text-secondary">{item.meta}</div> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
