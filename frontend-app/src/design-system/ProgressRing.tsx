import type { JSX } from "react";

import { cn } from "@/lib/utils";

export type ProgressRingProps = {
  readonly value: number;
  readonly size?: number;
  readonly stroke?: number;
  readonly className?: string;
  readonly label: string;
};

export function ProgressRing({
  value,
  size = 88,
  stroke = 8,
  className,
  label,
}: ProgressRingProps): JSX.Element {
  const pct = Math.min(100, Math.max(0, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${pct}%`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-surface-tertiary/80"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="motion-reduce:transition-none stroke-brand transition-[stroke-dashoffset] duration-500"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-sm font-bold tabular-nums text-text-primary">{pct}%</span>
    </div>
  );
}
