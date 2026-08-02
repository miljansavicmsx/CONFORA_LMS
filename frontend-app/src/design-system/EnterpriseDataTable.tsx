import { ChevronRight } from "lucide-react";
import type { JSX, ReactNode, HTMLAttributes } from "react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";

import { EnterpriseAiBadge } from "./EnterpriseAiBadge";
import type { Severity } from "./SeverityBadge";
import { SeverityBadge } from "./SeverityBadge";
import { WorkflowBadge } from "./WorkflowBadge";
import { ds } from "./tokens";

export type EnterpriseDataTableColumn = {
  readonly id: string;
  readonly header: string;
  readonly className?: string;
};

export type EnterpriseDataTableRow = {
  readonly id: string;
  readonly cells: readonly ReactNode[];
  readonly severity?: Severity;
  readonly href?: string;
  readonly aiAssisted?: boolean;
  readonly workflowLabel?: string;
  /** Spaja se u `<tr>` (npr. tab focus, keyboard navigacija). */
  readonly trProps?: Omit<HTMLAttributes<HTMLTableRowElement>, "id" | "children">;
};

export type EnterpriseDataTableProps = {
  readonly caption: string;
  readonly columns: readonly EnterpriseDataTableColumn[];
  readonly rows: readonly EnterpriseDataTableRow[];
  readonly empty?: ReactNode;
  readonly className?: string;
  readonly ariaLabel: string;
  /** Omogućava vertikalni scroll tabele na desktopu uz lijepljivo zaglavlje. */
  readonly stickyHeader?: boolean;
  /** Tailwind / proizvoljna CSS klasa za max visinu + overflow (npr. `max-h-[min(60vh,28rem)]`). */
  readonly desktopScrollClassName?: string;
};

const sevLabel: Record<Severity, string> = {
  danger: "Hitno",
  warning: "Upozorenje",
  info: "Informacija",
  success: "U redu",
};

const sevRow: Record<Severity, string> = {
  danger: "border-l-4 border-l-red-500/70 bg-red-500/[0.05]",
  warning: "border-l-4 border-l-amber-500/65 bg-amber-500/[0.05]",
  info: "border-l-4 border-l-sky-500/55 bg-sky-500/[0.04]",
  success: "border-l-4 border-l-emerald-500/55 bg-emerald-500/[0.04]",
};

/**
 * Tabela na md+; na manjim širinama kartice po redu — workflow, severity, AI u zaglavlju kartice.
 */
export function EnterpriseDataTable({
  caption,
  columns,
  rows,
  empty,
  className,
  ariaLabel,
  stickyHeader = false,
  desktopScrollClassName,
}: EnterpriseDataTableProps): JSX.Element {
  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-border/50 bg-surface-secondary/30 p-6 text-sm text-text-secondary",
          className,
        )}
        role="region"
        aria-label={ariaLabel}
      >
        {empty ?? <p>Nema redova u ovom presjeku.</p>}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)} role="region" aria-label={ariaLabel}>
      <div className={cn("hidden md:block", desktopScrollClassName ?? "overflow-x-auto")}>
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border/50">
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className={cn(
                    "pb-2 pl-3 pr-2 pt-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted",
                    stickyHeader &&
                      "sticky top-0 z-[1] border-b border-border/50 bg-surface-primary/95 text-text-muted backdrop-blur-sm supports-[backdrop-filter]:bg-surface-primary/80",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                {...row.trProps}
                className={cn(
                  "border-b border-border/35",
                  row.severity ? sevRow[row.severity] : "bg-surface-primary/20",
                  row.trProps?.className,
                )}
              >
                {row.cells.map((cell, i) => (
                  <td key={`${row.id}-c-${String(i)}`} className={cn("align-top px-3 py-3 text-text-primary", columns[i]?.className)}>
                    {i === 0 ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {row.severity ? (
                          <SeverityBadge severity={row.severity}>{sevLabel[row.severity]}</SeverityBadge>
                        ) : null}
                        {row.aiAssisted ? (
                          <EnterpriseAiBadge humanApprovalRequired>AI</EnterpriseAiBadge>
                        ) : null}
                        {row.workflowLabel ? <WorkflowBadge className="text-[10px]">{row.workflowLabel}</WorkflowBadge> : null}
                        <span>{cell}</span>
                      </div>
                    ) : (
                      cell
                    )}
                    {i === row.cells.length - 1 && row.href ? (
                      <div className="mt-1">
                        <Link to={row.href} className={cn(ds.focusRing, "inline-flex items-center gap-1 text-xs font-medium text-brand")}>
                          Otvori <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                      </div>
                    ) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden" aria-label={`${caption} — mobilni pregled`}>
        {rows.map((row) => (
          <li
            key={row.id}
            className={cn(
              "rounded-xl border border-border/45 p-4",
              row.severity ? sevRow[row.severity] : "bg-surface-primary/25",
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              {row.severity ? <SeverityBadge severity={row.severity}>{sevLabel[row.severity]}</SeverityBadge> : null}
              {row.aiAssisted ? <EnterpriseAiBadge humanApprovalRequired>AI</EnterpriseAiBadge> : null}
              {row.workflowLabel ? <WorkflowBadge>{row.workflowLabel}</WorkflowBadge> : null}
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              {columns.map((col, i) => (
                <div key={col.id}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">{col.header}</dt>
                  <dd className="mt-0.5 text-text-primary">{row.cells[i] ?? "—"}</dd>
                </div>
              ))}
            </dl>
            {row.href ? (
              <Link
                to={row.href}
                className={cn(ds.focusRing, "mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand")}
              >
                Otvori <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
