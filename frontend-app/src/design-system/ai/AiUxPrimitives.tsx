import type { JSX, ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { EnterpriseAiBadge } from "../EnterpriseAiBadge";
import { ds } from "../tokens";

/** Jednostavan indikator „povjerenja“ u AI signal (vizuelni, bez API poslovnog skora). */
export function AIConfidenceMeter({
  valuePct,
  label,
  className,
}: {
  readonly valuePct: number;
  readonly label: string;
  readonly className?: string;
}): JSX.Element {
  const v = Math.min(100, Math.max(0, Math.round(valuePct)));
  const slug = `${label}-${v}`.replace(/\s+/g, "-");
  const descId = `ai-confidence-desc-${slug}`;
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-text-muted">{label}</span>
        <span className={ds.typography.mono} id={descId} aria-live="polite">
          {v}%
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-violet-500/15"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
        aria-labelledby={descId}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-violet-500/80 to-sky-500/75 motion-safe:transition-all motion-safe:duration-300 motion-reduce:transition-none",
          )}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

export function AIHumanApprovalNotice({
  className,
  children,
}: {
  readonly className?: string;
  readonly children?: ReactNode;
}): JSX.Element {
  return (
    <aside
      className={cn(
        "rounded-xl border border-amber-400/35 bg-amber-500/[0.08] p-4 text-xs leading-relaxed text-amber-100",
        ds.focusRingAi,
        className,
      )}
      role="note"
      aria-label={ds.aiCopyHr.needsApproval}
    >
      <p className="font-semibold text-amber-50">{ds.aiCopyHr.needsApproval}</p>
      <p className="mt-1 text-amber-100/90">{children ?? "Odluku i službeni ishod ostaje čovjek u postojećim tijekovima sustava."}</p>
    </aside>
  );
}

export function AIExplanationDrawer({
  trigger,
  title,
  children,
}: {
  readonly trigger: ReactNode;
  readonly title: string;
  readonly children: ReactNode;
}): JSX.Element {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "max-h-[85vh] overflow-y-auto border-border/60 bg-surface-secondary text-text-primary sm:max-w-md",
        )}
      >
        <DialogHeader>
          <EnterpriseAiBadge humanApprovalRequired={false}>{ds.aiCopyHr.generated}</EnterpriseAiBadge>
          <DialogTitle className="pr-10 pt-2 text-lg">{title}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 pt-2 text-sm text-text-secondary">{children}</div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
