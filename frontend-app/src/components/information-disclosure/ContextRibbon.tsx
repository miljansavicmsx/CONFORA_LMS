import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";

export type ContextRibbonItem = {
  readonly id: string;
  readonly label: string;
  readonly to: string;
  readonly icon?: LucideIcon;
  readonly hint?: string;
};

export function ContextRibbon({
  title,
  items,
  className,
}: {
  readonly title?: string;
  readonly items: readonly ContextRibbonItem[];
  readonly className?: string;
}): ReactNode {
  if (items.length === 0) return null;
  return (
    <nav
      className={cn("rounded-2xl border border-border/45 bg-surface-primary/20 p-3", className)}
      aria-label={title ?? "Kontekstualna navigacija"}
    >
      {title ? <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</p> : null}
      <p className="sr-only">Brzi skokovi u povezane module; Enter aktivira link.</p>
      <ul className="flex flex-wrap gap-2">
        {items.map((it) => (
          <li key={it.id}>
            <Link
              to={it.to}
              className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-surface-secondary/35 px-3 py-2 text-xs font-semibold text-brand outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {it.icon ? <it.icon className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
              <span>{it.label}</span>
              {it.hint ? <span className="sr-only">{it.hint}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
