import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, type JSX } from "react";

import { cn } from "@/lib/utils";

const SIZE = 88;
const STROKE = 6;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export type HeroProgressRingProps = {
  readonly percent: number;
  readonly className?: string;
};

export function HeroProgressRing({
  percent,
  className,
}: HeroProgressRingProps): JSX.Element {
  const target = Math.min(100, Math.max(0, percent));
  const progress = useMotionValue(0);
  const smooth = useSpring(progress, { stiffness: 80, damping: 22 });
  const offset = useTransform(smooth, (p) => CIRC - (p / 100) * CIRC);

  useEffect(() => {
    progress.set(target);
  }, [progress, target]);

  return (
    <div
      className={cn("relative", className)}
      style={{ width: SIZE, height: SIZE }}
      aria-label={`Ukupni napredak ${Math.round(target)} posto`}
      role="img"
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="rotate-[-90deg]"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          className="text-surface-tertiary/80"
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeLinecap="round"
          className="text-brand"
          strokeDasharray={CIRC}
          style={{ strokeDashoffset: offset }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold tabular-nums text-text-primary">
          {Math.round(target)}
          %
        </span>
      </div>
    </div>
  );
}
