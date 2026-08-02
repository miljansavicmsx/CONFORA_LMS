import type { JSX, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ds } from "./tokens";

/**
 * Produkt „shell”: centrirana širina, zajednički gutter, blagi pozadinski gradijent (ne dira routing).
 */
export function EnterprisePageShell({
  children,
  className,
  withBackdrop = true,
}: {
  readonly children: ReactNode;
  readonly className?: string;
  /** @default true */
  readonly withBackdrop?: boolean;
}): JSX.Element {
  return (
    <div className={cn("relative min-h-[min(70vh,640px)]", ds.pageMaxWidth, className)}>
      {withBackdrop ? <div className={ds.pageBackdrop} aria-hidden /> : null}
      <div className="relative">{children}</div>
    </div>
  );
}
