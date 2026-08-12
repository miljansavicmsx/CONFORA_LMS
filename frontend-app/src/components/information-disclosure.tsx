import type { JSX } from "react";

import { cn } from "@/lib/utils";

export type ContextRibbonItem = {
  readonly label: string;
  readonly rationale: string;
};

export function ContextRibbon({ className, items, title }: { readonly className?: string; readonly items: readonly ContextRibbonItem[]; readonly title: string }): JSX.Element {
  return (
    <section className={cn("rounded-xl border border-border/40 bg-surface-secondary/30 px-4 py-3", className)} aria-label={title}>
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      <ul className="mt-2 space-y-1 text-xs text-text-secondary">
        {items.map((item) => <li key={item.label}><span className="font-medium text-text-primary">{item.label}: </span>{item.rationale}</li>)}
      </ul>
    </section>
  );
}
