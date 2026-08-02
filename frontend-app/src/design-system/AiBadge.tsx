import { Sparkles } from "lucide-react";
import type { JSX, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AiBadge({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-violet-500/35 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-200",
        className,
      )}
    >
      <Sparkles className="h-3 w-3" aria-hidden />
      {children}
    </span>
  );
}
