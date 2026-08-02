import type { JSX, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ds } from "./tokens";

export type EnterpriseHeroTone = "governance" | "technical";

const toneCls: Record<EnterpriseHeroTone, string> = {
  governance: ds.heroPanel,
  technical: ds.heroPanelTechnical,
};

export function EnterpriseHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
  tone = "governance",
  className,
  id,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
  readonly aside?: ReactNode;
  readonly tone?: EnterpriseHeroTone;
  readonly className?: string;
  readonly id?: string;
}): JSX.Element {
  const titleId = id ? `${id}-title` : undefined;
  const descId = id ? `${id}-desc` : undefined;
  return (
    <section
      className={cn(toneCls[tone], className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div className="min-w-0 flex-1">
          <p className={tone === "technical" ? "text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400" : ds.sectionEyebrow}>
            {eyebrow}
          </p>
          <h1 id={titleId} className="mt-2 text-balance text-2xl font-bold tracking-tight sm:text-[1.75rem] md:text-[1.875rem]">
            {title}
          </h1>
          {description ? (
            <div id={descId} className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">
              {description}
            </div>
          ) : null}
          {actions ? <div className="mt-5 flex flex-wrap gap-2">{actions}</div> : null}
        </div>
        {aside ? <div className="w-full shrink-0 lg:w-auto lg:max-w-sm">{aside}</div> : null}
      </div>
    </section>
  );
}
