import type { ComponentProps, ElementType, JSX, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ds } from "../tokens";

export type ConforaCardVariant =
  | "enterprise"
  | "learning"
  | "governance"
  | "system"
  | "trust"
  | "ai_insight"
  | "metric"
  | "workflow"
  | "certificate"
  | "risk";

function variantSemantics(v: ConforaCardVariant): (typeof ds.semantics)[keyof typeof ds.semantics] {
  switch (v) {
    case "learning":
      return ds.semantics.learning;
    case "governance":
      return ds.semantics.governance;
    case "system":
      return ds.semantics.system;
    case "trust":
    case "certificate":
      return ds.semantics.trust;
    case "ai_insight":
      return ds.semantics.ai;
    case "risk":
      return ds.semantics.risk;
    case "workflow":
      return ds.semantics.governance;
    case "metric":
    case "enterprise":
    default:
      return ds.semantics.neutral;
  }
}

/** Jedinstvena kartica DS-a — slotovi za naslove, ikonu, badge, akcije. */
export function ConforaCard({
  variant = "enterprise",
  density = "comfortable",
  interactive = false,
  heading,
  headingLevel: H = "h3",
  icon,
  badge,
  footer,
  children,
  className,
  ariaLabel,
  as: Cmp = "div",
}: {
  readonly variant?: ConforaCardVariant;
  readonly density?: "comfortable" | "compact";
  readonly interactive?: boolean;
  readonly heading?: ReactNode;
  readonly headingLevel?: "h2" | "h3" | "h4";
  readonly icon?: ReactNode;
  readonly badge?: ReactNode;
  readonly footer?: ReactNode;
  readonly children?: ReactNode;
  readonly className?: string;
  readonly ariaLabel?: string;
  readonly as?: ElementType;
}): JSX.Element {
  const sem = variantSemantics(variant);
  const pad = density === "compact" ? ds.spacing.sm : ds.spacing.lg;
  const base =
    variant === "workflow"
      ? ds.ribbon
      : cn(ds.widget, ds.elevation.raised);
  const isButton = Cmp === "button";

  return (
    <Cmp
      className={cn(
        base,
        pad,
        sem.accentBorder,
        sem.accentBar,
        interactive && !isButton && ds.interactiveCard,
        className,
      )}
      aria-label={ariaLabel}
      {...(interactive && isButton ? { type: "button" as const } : {})}
    >
      {(icon || badge || heading) ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            {icon ? (
              <span className="mt-0.5 shrink-0 text-text-muted [&_svg]:h-6 [&_svg]:w-6" aria-hidden={!ariaLabel}>
                {icon}
              </span>
            ) : null}
            <div className="min-w-0 flex-1">
              {heading ? (
                <H className={cn(ds.typography.section, "text-balance")}>{heading}</H>
              ) : null}
              {badge ? <div className="mt-2 flex flex-wrap gap-2">{badge}</div> : null}
            </div>
          </div>
        </div>
      ) : null}
      {children ? <div className={cn(icon || heading ? "mt-4" : null)}>{children}</div> : null}
      {footer ? <div className="mt-4 flex flex-wrap gap-2 border-t border-border/40 pt-4">{footer}</div> : null}
    </Cmp>
  );
}

export const EnterpriseCard = (
  props: Omit<ComponentProps<typeof ConforaCard>, "variant">,
): JSX.Element => <ConforaCard {...props} variant="enterprise" />;
export const LearningCard = (
  props: Omit<ComponentProps<typeof ConforaCard>, "variant">,
): JSX.Element => <ConforaCard {...props} variant="learning" />;
export const GovernanceCard = (
  props: Omit<ComponentProps<typeof ConforaCard>, "variant">,
): JSX.Element => <ConforaCard {...props} variant="governance" />;
export const SystemCard = (
  props: Omit<ComponentProps<typeof ConforaCard>, "variant">,
): JSX.Element => <ConforaCard {...props} variant="system" />;
export const TrustCard = (
  props: Omit<ComponentProps<typeof ConforaCard>, "variant">,
): JSX.Element => <ConforaCard {...props} variant="trust" />;
export const AIInsightCard = (
  props: Omit<ComponentProps<typeof ConforaCard>, "variant">,
): JSX.Element => <ConforaCard {...props} variant="ai_insight" />;
export const MetricCard = (
  props: Omit<ComponentProps<typeof ConforaCard>, "variant" | "density">,
): JSX.Element => <ConforaCard {...props} variant="metric" density="compact" />;
export const WorkflowCard = (
  props: Omit<ComponentProps<typeof ConforaCard>, "variant">,
): JSX.Element => <ConforaCard {...props} variant="workflow" />;
export const CertificateCard = (
  props: Omit<ComponentProps<typeof ConforaCard>, "variant">,
): JSX.Element => <ConforaCard {...props} variant="certificate" />;
export const RiskCard = (
  props: Omit<ComponentProps<typeof ConforaCard>, "variant">,
): JSX.Element => <ConforaCard {...props} variant="risk" />;
