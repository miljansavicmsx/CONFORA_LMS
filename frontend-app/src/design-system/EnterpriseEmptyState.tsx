import type { LucideIcon } from "lucide-react";
import type { JSX, ReactNode } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ds } from "./tokens";

export function EnterpriseEmptyState({
  icon: Icon,
  title,
  description,
  primary,
  secondary,
  className,
  roleRegion = true,
  id,
}: {
  readonly icon?: LucideIcon;
  readonly title: string;
  readonly description?: ReactNode;
  readonly primary?: { readonly label: string; readonly to: string; readonly external?: boolean } | readonly { readonly label: string; readonly to: string; readonly external?: boolean }[];
  readonly secondary?: { readonly label: string; readonly onClick: () => void };
  readonly className?: string;
  readonly roleRegion?: boolean;
  readonly id?: string;
}): JSX.Element {
  const titleId = id ? `${id}-title` : undefined;
  const primaryList = primary ? (Array.isArray(primary) ? primary : [primary]) : [];
  const wrapProps = roleRegion ? { role: "region" as const, "aria-labelledby": titleId, id } : {};

  return (
    <section {...wrapProps} className={cn(ds.emptyMuted, "text-text-secondary", className)}>
      {Icon ? <Icon className="mx-auto h-10 w-10 text-text-muted" aria-hidden /> : null}
      <h2 id={titleId} className="mx-auto mt-4 max-w-md text-lg font-semibold text-text-primary">
        {title}
      </h2>
      {description ? <div className="mx-auto mt-2 max-w-lg text-sm leading-relaxed">{description}</div> : null}
      {primaryList.length > 0 ? (
        <div className="mx-auto mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row sm:flex-wrap">
          {primaryList.map((p) =>
            p.external ? (
              <Button
                key={`${p.to}-${p.label}`}
                size="sm"
                variant="outline"
                className={ds.focusRing}
                asChild
                type="button"
              >
                <a href={p.to} rel="noreferrer noopener" target="_blank">
                  {p.label}
                </a>
              </Button>
            ) : (
              <Button key={`${p.to}-${p.label}`} size="sm" className="bg-brand text-white hover:bg-brand/90" asChild type="button">
                <Link to={p.to}>{p.label}</Link>
              </Button>
            ),
          )}
        </div>
      ) : null}
      {secondary ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("mt-2 text-text-muted", ds.focusRing)}
          onClick={secondary.onClick}
        >
          {secondary.label}
        </Button>
      ) : null}
    </section>
  );
}
