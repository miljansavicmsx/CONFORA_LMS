import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { JSX, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { TrustBadge } from "../badges";
import { ds } from "../tokens";

/** Javna / interna kartica rezultata verifikacije (trust-first). */
export function TrustVerificationCard({
  verified,
  title,
  subtitle,
  children,
  footer,
  className,
}: {
  readonly verified: boolean;
  readonly title: string;
  readonly subtitle?: string;
  readonly children?: ReactNode;
  readonly footer?: ReactNode;
  readonly className?: string;
}): JSX.Element {
  return (
    <div
      role="region"
      aria-label={
        verified
          ? "Rezultat verifikacije: certifikat valjan ili pronađen"
          : "Rezultat verifikacije: nije potvrđen ili javno nedostupan"
      }
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6",
        verified
          ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/[0.1] to-surface-secondary/80"
          : "border-amber-500/40 bg-gradient-to-br from-amber-500/[0.08] to-surface-secondary/80",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {verified ? (
          <ShieldCheck className="h-8 w-8 shrink-0 text-emerald-300" aria-hidden />
        ) : (
          <ShieldAlert className="h-8 w-8 shrink-0 text-amber-300" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-text-primary">{title}</h2>
            <TrustBadge verified={verified}>{verified ? "Verifikovano" : "Nije potvrđeno"}</TrustBadge>
          </div>
          {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
          {children ? <div className="mt-4 space-y-2 text-sm">{children}</div> : null}
          {footer ? <div className="mt-4 border-t border-border/40 pt-4 text-xs text-text-muted">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

/** Prikaz kriptografskog otiska ili reference (kopira se ručno ili preko aplikacije). */
export function CertificateHashBlock({
  label = "Otisak / hash",
  value,
  monospace = true,
  className,
}: {
  readonly label?: string;
  readonly value: string;
  readonly monospace?: boolean;
  readonly className?: string;
}): JSX.Element {
  return (
    <div className={cn("rounded-xl border border-border/50 bg-black/25 p-4", className)}>
      <p className={ds.typography.caption}>{label}</p>
      <p
        className={cn(
          "mt-2 break-all text-sm leading-relaxed text-text-primary",
          monospace ? ds.typography.mono : "",
        )}
        aria-label={`${label}: ${value}`}
      >
        {value}
      </p>
      <p className="sr-only">Korisnici ovaj niz koriste za tehničku provjeru integriteta dokumenta ako je dostupna javna rutina.</p>
    </div>
  );
}

/** Kraći vizuel dokaza (lanac zapisnika) bez promjene backend modela. */
export function EvidenceChainPreview({
  items,
  ariaLabel = "Lanac evidencije",
}: {
  readonly items: readonly { id: string; label: string; meta?: string }[];
  readonly ariaLabel?: string;
}): JSX.Element {
  return (
    <nav aria-label={ariaLabel}>
      <ol className="space-y-2">
        {items.map((item, idx) => (
          <li
            key={item.id}
            className="flex gap-3 rounded-lg border border-border/45 bg-surface-primary/35 px-3 py-2"
          >
            <span className="mt-0.5 shrink-0 text-xs tabular-nums text-text-muted" aria-hidden>
              {idx + 1}.
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">{item.label}</p>
              {item.meta ? <p className="text-xs text-text-muted">{item.meta}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function CertificateStatusPanel({
  headline,
  body,
  statusKey,
}: {
  readonly headline: string;
  readonly body: ReactNode;
  readonly statusKey: "active" | "suspended" | "expired" | "revoked" | "pending";
}): JSX.Element {
  const tones: Record<
    "active" | "suspended" | "expired" | "revoked" | "pending",
    { wrapper: string; border: string }
  > = {
    active: { wrapper: "from-emerald-500/[0.08]", border: "border-emerald-500/35" },
    pending: { wrapper: "from-sky-500/[0.08]", border: "border-sky-500/35" },
    suspended: { wrapper: "from-amber-500/[0.1]", border: "border-amber-500/40" },
    expired: { wrapper: "from-red-500/[0.08]", border: "border-red-500/35" },
    revoked: { wrapper: "from-rose-500/[0.1]", border: "border-rose-500/40" },
  };
  const t = tones[statusKey];
  return (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br to-surface-secondary/90 p-5",
        t.border,
        t.wrapper,
      )}
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-semibold text-text-primary">{headline}</p>
      <div className={cn(ds.typography.body, "mt-2")}>{body}</div>
    </div>
  );
}
