import { type JSX } from "react";

import { cn } from "@/lib/utils";
import { humanizeAuditAction } from "@/lib/entity-relationships/relationship-evidence";
import { MARKETING_BADGE_LABELS } from "@/lib/entity-relationships/relationship-badges";

import { RelationshipBadge } from "./RelationshipBadge";

export type AuditEvidenceRow = {
  readonly eventId: string;
  readonly createdAt: string;
  readonly action: string;
  readonly resourceType?: string;
  readonly resourceId?: string;
  readonly severity?: string;
  readonly outcome?: string;
};

export function RelationshipEvidenceChain({
  rows,
  title = "Audit trag / dokazni lanac",
}: {
  readonly rows: readonly AuditEvidenceRow[];
  readonly title?: string;
}): JSX.Element {
  if (!rows.length) {
    return (
      <p className="text-sm text-text-muted">
        Nema učitanih audit stavki. Unesi ID u ISO audit modulu za evidenciju lanca osobne certifikacije.
      </p>
    );
  }

  return (
    <section aria-label={title} className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h3>
        <RelationshipBadge label={MARKETING_BADGE_LABELS.auditEvidence} tone="audit" />
      </div>
      <ol className="space-y-2 border-l border-brand/35 pl-4">
        {rows.map((r, idx) => (
          <li
            key={r.eventId}
            className={cn("relative rounded-lg border border-border/40 bg-surface-secondary/30 px-3 py-2")}
          >
            <span className="sr-only">
              Korak {idx + 1} od {rows.length}. {humanizeAuditAction(r.action)} na {r.createdAt}.
            </span>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-muted">
              <time dateTime={r.createdAt}>{r.createdAt}</time>
              {r.outcome ? (
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 font-semibold uppercase",
                    r.outcome === "BLOCKED" ? "bg-rose-500/15 text-rose-100" : "bg-slate-500/15 text-slate-100",
                  )}
                >
                  {r.outcome}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm font-medium text-text-primary">{humanizeAuditAction(r.action)}</p>
            <p className="text-xs text-text-secondary">
              {[r.resourceType, r.resourceId].filter(Boolean).join(" · ") || "—"}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
