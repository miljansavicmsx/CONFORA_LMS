import type { JSX } from "react";

import { cn } from "@/lib/utils";

import { APP_WORKSPACE_LABELS, type AppWorkspaceId } from "@/lib/app-workspace";
import { EnterpriseAiBadge, EnterpriseStatusBadge } from "@/design-system";
import { TrustBadge } from "@/design-system/badges";
import { ds } from "@/design-system/tokens";
import type { Severity } from "@/design-system/SeverityBadge";

import type { CommandEntity } from "./command-entity-types";
import { iconForCommandEntity } from "./command-icon-map";

function mapSeverity(s: string): Severity {
  const x = s.toLowerCase();
  if (x.includes("high") || x.includes("critical") || x.includes("severe")) return "danger";
  if (x.includes("low")) return "info";
  if (x.includes("success") || x.includes("closed")) return "success";
  return "warning";
}

export type CommandEntityRowProps = {
  readonly entity: CommandEntity;
  readonly selected?: boolean;
  readonly onTogglePin?: (entity: CommandEntity) => void;
  readonly pinned?: boolean;
};

export function CommandEntityRow({
  entity,
  selected = false,
  onTogglePin,
  pinned = false,
}: CommandEntityRowProps): JSX.Element {
  const Icon = iconForCommandEntity(entity);
  const wsLabel = APP_WORKSPACE_LABELS[entity.workspace as AppWorkspaceId] ?? entity.workspace;
  const updated = entity.updatedAt
    ? new Date(entity.updatedAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })
    : null;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-start gap-2.5 text-left",
        selected && "text-sky-100",
      )}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
        <Icon className="h-4 w-4 text-sky-300/90" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate font-medium text-[#F8FAFC]">{entity.title}</span>
          {entity.source === "remote" ? (
            <span className="shrink-0 scale-90">
              <TrustBadge verified>Katalog</TrustBadge>
            </span>
          ) : null}
        </div>
        {entity.subtitle ? <p className="truncate text-xs text-[#94A3B8]">{entity.subtitle}</p> : null}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <WorkspacePill workspace={entity.workspace} label={wsLabel} />
          {entity.severity ? (
            <EnterpriseStatusBadge severity={mapSeverity(entity.severity)}>{entity.severity}</EnterpriseStatusBadge>
          ) : null}
          {entity.status ? (
            <span className="rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#CBD5E1]">
              {entity.status}
            </span>
          ) : null}
          {entity.aiHint ? (
            <EnterpriseAiBadge humanApprovalRequired={false}>{entity.aiHint}</EnterpriseAiBadge>
          ) : null}
          {updated ? <span className="text-[10px] text-[#64748B]">{updated}</span> : null}
        </div>
      </div>
      {onTogglePin ? (
        <button
          type="button"
          className={cn(
            "shrink-0 rounded-lg border border-white/10 px-2 py-1 text-[10px] font-semibold text-[#94A3B8] motion-safe:transition-colors",
            "hover:border-brand/40 hover:text-brand",
            "motion-reduce:transition-none",
            ds.focusRing,
            pinned && "border-brand/40 text-brand",
          )}
          aria-label={pinned ? "Otkvači" : "Prikvači"}
          aria-pressed={pinned}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onTogglePin(entity);
          }}
        >
          {pinned ? "★" : "☆"}
        </button>
      ) : null}
    </div>
  );
}

function WorkspacePill({
  workspace,
  label,
}: {
  readonly workspace: AppWorkspaceId;
  readonly label: string;
}): JSX.Element {
  const tone =
    workspace === "learning"
      ? "border-sky-400/35 bg-sky-500/[0.12] text-sky-100"
      : workspace === "governance"
        ? "border-emerald-400/35 bg-emerald-500/[0.12] text-emerald-50"
        : "border-amber-400/35 bg-amber-500/[0.12] text-amber-50";
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide", tone)}>
      {label}
    </span>
  );
}
