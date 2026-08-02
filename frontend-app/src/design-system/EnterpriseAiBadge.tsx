import type { JSX, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { AiBadge } from "./AiBadge";
import { ds } from "./tokens";

export function EnterpriseAiBadge({
  children,
  humanApprovalRequired,
  className,
}: {
  readonly children: ReactNode;
  /** Vizuelni signal da odluku mora dati čovjek na serveru (UX oznaka, bez promjene API-ja). */
  readonly humanApprovalRequired?: boolean;
  readonly className?: string;
}): JSX.Element {
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-2", className)}>
      <AiBadge>{children}</AiBadge>
      {humanApprovalRequired ? (
        <span
          className={cn(
            ds.semantics.warning.accentBorder,
            "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100",
          )}
        >
          Zahtjev ljudske potvrde
        </span>
      ) : null}
    </span>
  );
}
