import { ArrowRight } from "lucide-react";
import type { JSX, ReactNode } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ds } from "./tokens";

export function EnterpriseQuickAction({
  to,
  label,
  variant = "default",
}: {
  readonly to: string;
  readonly label: string;
  readonly variant?: "default" | "outline";
  readonly icon?: ReactNode;
}): JSX.Element {
  return (
    <Button
      size="sm"
      type="button"
      variant={variant === "outline" ? "outline" : "secondary"}
      className={cn("gap-1 font-semibold", ds.focusRing, variant === "outline" ? "border-border/60 bg-transparent" : "")}
      asChild
    >
      <Link to={to}>
        {label}
        <ArrowRight className="ml-1 h-3.5 w-3.5 opacity-75" aria-hidden />
      </Link>
    </Button>
  );
}
