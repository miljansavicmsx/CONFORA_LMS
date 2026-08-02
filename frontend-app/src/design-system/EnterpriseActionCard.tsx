import { ArrowRight } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";

import { ds } from "./tokens";

export function EnterpriseActionCard({
  to,
  title,
  description,
  meta,
}: {
  readonly to: string;
  readonly title: string;
  readonly description?: string;
  readonly meta?: string;
}): JSX.Element {
  return (
    <Link
      to={to}
      className={cn(ds.actionCard, ds.focusRing)}
    >
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {description ? <p className="mt-1 text-xs leading-relaxed text-text-secondary">{description}</p> : null}
        {meta ? <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-brand">{meta}</p> : null}
      </div>
      <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand opacity-95 group-hover:text-brand">
        Otvori
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
