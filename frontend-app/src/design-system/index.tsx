import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export { EnterpriseAiBadge, EnterpriseStatusBadge } from "./enterprise-badges";

type ChildrenProps = { readonly children: ReactNode; readonly className?: string };

export const ds = {
  elevation: { spotlight: "shadow-lg shadow-black/20" },
  typography: { body: "text-sm text-text-secondary", caption: "text-xs text-text-muted" },
  semantics: {
    warning: { accentBorder: "border border-amber-400/30 bg-amber-400/10" },
    learning: { accentBorder: "border border-sky-400/30 bg-sky-400/10" },
    governance: { accentBorder: "border border-violet-400/30 bg-violet-400/10" },
    trust: { accentBorder: "border border-emerald-400/30 bg-emerald-400/10" },
  },
  focusRingTrust: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
  gridOps: "grid gap-4 md:grid-cols-3",
} as const;

export function CertificationBadge({ children, scope }: ChildrenProps & { readonly scope: "exam_pass" | "credential" }) {
  return <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", scope === "credential" ? "bg-emerald-400/15 text-emerald-200" : "bg-sky-400/15 text-sky-200")}>{children}</span>;
}

export function CredentialLifecycleBadge({ lifecycleStatus }: { readonly lifecycleStatus: string }) {
  return <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs text-text-secondary">{lifecycleStatus}</span>;
}

export function CertificateHashBlock({ label, value }: { readonly label: string; readonly value: string }) {
  return <p className="break-all rounded-lg border border-border/40 px-2 py-1 text-xs text-text-secondary"><span className="font-medium text-text-primary">{label}: </span><span className="font-mono">{value}</span></p>;
}

export function CertificateCard({ ariaLabel, badge, children, className, footer, heading, headingLevel: Heading, icon }: ChildrenProps & { readonly ariaLabel: string; readonly badge: ReactNode; readonly footer: ReactNode; readonly heading: string; readonly headingLevel: "h2" | "h3"; readonly icon: ReactNode }) {
  return <article aria-label={ariaLabel} className={cn("rounded-2xl border border-border/50 bg-surface-secondary/45 p-5", className)}><div className="flex items-start gap-3"><span className="mt-0.5">{icon}</span><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap gap-2">{badge}</div><Heading className="text-base font-semibold text-text-primary">{heading}</Heading></div></div><div className="mt-4">{children}</div><div className="mt-5">{footer}</div></article>;
}

export function MetricCard({ ariaLabel, children, className, icon }: ChildrenProps & { readonly ariaLabel: string; readonly icon: ReactNode }) {
  return <section aria-label={ariaLabel} className={cn("rounded-xl bg-surface-secondary/50 p-4", className)}><div className="mb-3">{icon}</div>{children}</section>;
}

export function TrustBadge({ children, verified }: ChildrenProps & { readonly verified: boolean }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", verified ? "bg-emerald-400/15 text-emerald-200" : "bg-surface-secondary text-text-secondary")}>{children}</span>;
}

export function TrustHero({ description, eyebrow, id, secondaryAction, statusStrip, title, trustBadge }: { readonly description: string; readonly eyebrow: string; readonly id: string; readonly secondaryAction: ReactNode; readonly statusStrip: ReactNode; readonly title: string; readonly trustBadge?: ReactNode }) {
  return <section id={id} className="rounded-2xl border border-border/50 bg-surface-secondary/35 p-6"><p className="text-xs font-semibold uppercase tracking-wide text-brand">{eyebrow}</p><div className="mt-2 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold text-text-primary">{title}</h1><p className="mt-2 max-w-2xl text-sm text-text-secondary">{description}</p></div>{secondaryAction}</div><div className="mt-4 flex flex-wrap gap-2">{trustBadge}{statusStrip}</div></section>;
}
