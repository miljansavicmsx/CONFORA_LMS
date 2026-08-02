import type { ComponentProps, JSX, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ds } from "../tokens";

export type DomainHeroVariant = "learning" | "governance" | "system" | "trust" | "public";

const shells: Record<DomainHeroVariant, string> = {
  learning: ds.heroLearning,
  governance: ds.heroPanel,
  system: ds.heroSystem,
  trust: ds.heroTrust,
  public: ds.heroPublic,
};

const eyebrows: Record<DomainHeroVariant, string> = {
  learning: ds.semantics.learning.eyebrow,
  governance: ds.semantics.governance.eyebrow,
  system: ds.semantics.system.eyebrow,
  trust: ds.semantics.trust.eyebrow,
  public: ds.semantics.governance.eyebrow,
};

/** Standardiziran hero za domene CONFORA (LMS / governance / system / trust / public). */
export function DomainHero({
  variant = "learning",
  eyebrow,
  title,
  description,
  statusStrip,
  primaryAction,
  secondaryAction,
  aiInsight,
  trustBadge,
  aside,
  compact,
  gradient = true,
  className,
  id,
}: {
  readonly variant?: DomainHeroVariant;
  readonly eyebrow: string;
  readonly title: string;
  readonly description?: ReactNode;
  readonly statusStrip?: ReactNode;
  readonly primaryAction?: ReactNode;
  readonly secondaryAction?: ReactNode;
  readonly aiInsight?: ReactNode;
  readonly trustBadge?: ReactNode;
  readonly aside?: ReactNode;
  readonly compact?: boolean;
  readonly gradient?: boolean;
  readonly className?: string;
  readonly id?: string;
}): JSX.Element {
  const shell = shells[variant];
  const titleId = id ? `${id}-title` : undefined;
  const descId = id ? `${id}-desc` : undefined;
  const titleCls = compact
    ? "text-balance text-xl font-bold tracking-tight sm:text-[1.35rem]"
    : "text-balance text-2xl font-bold tracking-tight sm:text-[1.75rem] md:text-[1.875rem]";

  return (
    <section
      className={cn(shell, !gradient && "bg-surface-secondary/85", compact && "p-5 sm:p-6", className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
    >
      {(trustBadge || aiInsight || statusStrip) ? (
        <div className="mb-4 flex min-h-[2rem] flex-wrap items-center gap-2 border-b border-white/[0.06] pb-4">
          {trustBadge ? <div className="flex flex-wrap gap-2">{trustBadge}</div> : null}
          {statusStrip ? <div className="flex flex-wrap gap-2 text-xs text-text-secondary">{statusStrip}</div> : null}
          {aiInsight ? <div className="w-full">{aiInsight}</div> : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div className="min-w-0 flex-1">
          <p className={eyebrows[variant]}>{eyebrow}</p>
          <h1 id={titleId} className={cn(titleCls, "mt-2 tracking-tight")}>
            {title}
          </h1>
          {description ? (
            <div id={descId} className={cn(ds.typography.body, "mt-3 max-w-3xl text-text-secondary")}>
              {description}
            </div>
          ) : null}
          {primaryAction || secondaryAction ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {primaryAction}
              {secondaryAction}
            </div>
          ) : null}
        </div>
        {aside ? <div className="w-full shrink-0 lg:w-auto lg:max-w-sm">{aside}</div> : null}
      </div>
    </section>
  );
}

export const LearningHero = (p: Omit<ComponentProps<typeof DomainHero>, "variant">): JSX.Element => (
  <DomainHero {...p} variant="learning" />
);
export const GovernanceHero = (p: Omit<ComponentProps<typeof DomainHero>, "variant">): JSX.Element => (
  <DomainHero {...p} variant="governance" />
);
export const SystemHero = (p: Omit<ComponentProps<typeof DomainHero>, "variant">): JSX.Element => (
  <DomainHero {...p} variant="system" />
);
export const TrustHero = (p: Omit<ComponentProps<typeof DomainHero>, "variant">): JSX.Element => (
  <DomainHero {...p} variant="trust" />
);
export const PublicHero = (p: Omit<ComponentProps<typeof DomainHero>, "variant">): JSX.Element => (
  <DomainHero {...p} variant="public" />
);
