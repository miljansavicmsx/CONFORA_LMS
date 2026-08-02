import { animate } from "framer-motion";
import { ArrowRight, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type JSX } from "react";
import { Link } from "react-router";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  readonly emoji?: string;
  readonly icon?: LucideIcon;
  readonly label: string;
  readonly value: number | string;
  readonly subtitle: string;
  readonly trend: "up" | "down";
  readonly animateCount?: boolean;
  readonly className?: string;
  /** Kratak opis na hover (tooltip). */
  readonly tooltip?: string;
  /** Klik otvara stranicu s detaljima. */
  readonly href?: string;
};

export function StatCard({
  emoji,
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  animateCount = false,
  className,
  tooltip,
  href,
}: StatCardProps): JSX.Element {
  const isNumeric = typeof value === "number";
  const [display, setDisplay] = useState(() =>
    isNumeric && animateCount ? 0 : value,
  );
  const reducedMotion = useRef(false);

  useEffect(() => {
    try {
      reducedMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
    } catch {
      reducedMotion.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isNumeric || !animateCount) {
      setDisplay(value);
      return;
    }
    if (reducedMotion.current) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value as number, {
      duration: 1.15,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [animateCount, isNumeric, value]);

  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const trendClass = trend === "up" ? "text-emerald-400" : "text-amber-400";
  const trendArrow = trend === "up" ? "↑" : "↓";

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-text-secondary">
          {Icon ? (
            <Icon
              className="mr-2 inline-block h-4 w-4 align-text-bottom text-brand"
              aria-hidden
            />
          ) : emoji ? (
            <span className="mr-1.5" aria-hidden>
              {emoji}
            </span>
          ) : null}
          {label}
        </p>
        <span className="flex shrink-0 items-center gap-0.5" aria-hidden>
          <span className={cn("text-xs tabular-nums", trendClass)}>{trendArrow}</span>
          <TrendIcon className={cn("h-4 w-4", trendClass)} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums tracking-tight text-text-primary">
        {display}
      </p>
      {subtitle.trim() ? (
        <p className="mt-1 text-xs text-text-muted">{subtitle}</p>
      ) : null}
      {href ? (
        <p className="mt-3 flex items-center text-xs font-medium text-brand opacity-70 transition group-hover:opacity-100">
          Otvori detalje
          <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </p>
      ) : null}
    </>
  );

  const surfaceClass = cn(
    "relative rounded-xl border border-border/50 bg-surface-secondary p-5 transition-all duration-200",
    href &&
      "cursor-pointer hover:border-brand/45 hover:bg-surface-secondary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
    className,
  );

  const interactive = href ? (
    <Link to={href} className={cn("group block", surfaceClass)} aria-label={`${label}: otvori detalje`}>
      {body}
    </Link>
  ) : (
    <div className={surfaceClass}>{body}</div>
  );

  if (tooltip?.trim()) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{interactive}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-sm leading-snug">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return interactive;
}
