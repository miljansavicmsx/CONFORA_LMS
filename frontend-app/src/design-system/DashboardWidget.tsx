import type { JSX, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ds } from "./tokens";

export type DashboardWidgetProps = {
  readonly children: ReactNode;
  readonly className?: string;
  /** Tamniji / kompaktniji varijant */
  readonly variant?: "default" | "dense";
  readonly id?: string;
};

export function DashboardWidget({
  children,
  className,
  variant = "default",
  id,
}: DashboardWidgetProps): JSX.Element {
  return (
    <div
      id={id}
      className={cn(variant === "dense" ? ds.widgetDense : ds.widget, "p-4 sm:p-5", className)}
    >
      {children}
    </div>
  );
}
