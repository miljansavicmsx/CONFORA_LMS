import type { JSX } from "react";

import { cn } from "@/lib/utils";

/** Skeleton za lazy učitane cockpit sekcije (Suspense fallback). */
export function CockpitSectionSkeleton({ className }: { readonly className?: string }): JSX.Element {
  return (
    <div
      className={cn("animate-pulse space-y-4", className)}
      aria-busy
      aria-live="polite"
      aria-label="Učitavanje operativnog cockpit-a"
    >
      <div className="h-28 rounded-2xl bg-surface-secondary/85 ring-1 ring-border/30" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {["a", "b", "c", "d"].map((k) => (
          <div key={k} className="h-24 rounded-xl bg-surface-secondary/80" />
        ))}
      </div>
      <div className="h-40 rounded-xl bg-surface-secondary/75" />
      <div className="h-32 rounded-xl bg-surface-secondary/70 md:hidden" />
    </div>
  );
}
