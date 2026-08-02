import { type JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RelationshipBadgeTone } from "@/lib/entity-relationships/relationship-badges";

const toneClass: Record<RelationshipBadgeTone, string> = {
  governance: "border-brand/40 bg-brand/10 text-brand",
  risk: "border-rose-500/35 bg-rose-500/10 text-rose-100",
  trust: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
  audit: "border-amber-500/35 bg-amber-500/10 text-amber-100",
  neutral: "border-border/50 bg-surface-secondary/60 text-text-secondary",
};

export function RelationshipBadge({
  label,
  tone,
  className,
}: {
  readonly label: string;
  readonly tone: RelationshipBadgeTone;
  readonly className?: string;
}): JSX.Element {
  return (
    <Badge variant="outline" className={cn("font-medium", toneClass[tone], className)}>
      {label}
    </Badge>
  );
}
