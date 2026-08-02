import type { JSX, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type DashboardGridProps = {
  readonly children: ReactNode;
  readonly columns?: "kpi" | "ops" | "auto";
  readonly className?: string;
};

const cols: Record<NonNullable<DashboardGridProps["columns"]>, string> = {
  kpi: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4",
  ops: "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3",
  auto: "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
};

export function DashboardGrid({ children, columns = "auto", className }: DashboardGridProps): JSX.Element {
  return <div className={cn(cols[columns], className)}>{children}</div>;
}
