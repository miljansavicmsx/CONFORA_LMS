import type { JSX } from "react";

const SIZE = 20;
const STROKE = 2;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

export function MiniRingProgress({
  percent,
  className,
}: {
  readonly percent: number;
  readonly className?: string;
}): JSX.Element {
  const p = Math.min(100, Math.max(0, percent));
  const offset = C - (p / 100) * C;

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      aria-hidden
    >
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={R}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        className="text-surface-tertiary"
        opacity={0.45}
      />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={R}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeDasharray={C}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-brand"
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
      />
    </svg>
  );
}
