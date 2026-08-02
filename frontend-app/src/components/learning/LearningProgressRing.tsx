import type { JSX, ReactNode } from "react";

import { ProgressRing } from "@/design-system";
import { cn } from "@/lib/utils";

export function LearningProgressRing({
  value,
  label,
  size = 88,
  className,
  caption,
}: {
  readonly value: number;
  readonly label: string;
  readonly size?: number;
  readonly className?: string;
  readonly caption?: ReactNode;
}): JSX.Element {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <ProgressRing value={v} size={size} label={label} />
      {caption ? <p className="text-center text-xs text-text-muted">{caption}</p> : null}
    </div>
  );
}
