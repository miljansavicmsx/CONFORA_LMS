import { GitBranch } from "lucide-react";
import type { JSX } from "react";

import {
  resolveCertificationWorkflowStage,
  type WorkflowStagePresentation,
} from "@/lib/certification-ops-labels";
import { cn } from "@/lib/utils";

export type CertificationWorkflowStageBannerProps = {
  readonly applicationStatus: string;
  readonly assignmentState?: string;
  readonly reviewStatus?: string;
  readonly eligibilityStatus?: string;
  readonly decisionStatus?: string;
  readonly issuanceStatus?: string;
  readonly decisionOutcome?: string | null;
  readonly className?: string;
};

function StageContent({ stage }: { readonly stage: WorkflowStagePresentation }): JSX.Element {
  return (
    <div className="space-y-1 text-xs" data-testid="cert-workflow-stage-banner">
      <p className="font-medium text-text-primary" data-testid="cert-workflow-stage-label">
        Trenutna faza: {stage.stageLabel}
      </p>
      <p className="text-text-secondary" data-testid="cert-workflow-next-action">
        Sljedeća radnja: {stage.nextAction}
      </p>
      <p className="text-text-secondary" data-testid="cert-workflow-responsible-role">
        Odgovoran: {stage.responsibleRole}
      </p>
      {stage.blockedReason ? (
        <p className="text-amber-200/90" data-testid="cert-workflow-blocked-reason">
          Blokirano: {stage.blockedReason}
        </p>
      ) : null}
    </div>
  );
}

export function CertificationWorkflowStageBanner({
  applicationStatus,
  assignmentState,
  reviewStatus,
  eligibilityStatus,
  decisionStatus,
  issuanceStatus,
  decisionOutcome,
  className,
}: CertificationWorkflowStageBannerProps): JSX.Element {
  const stage = resolveCertificationWorkflowStage({
    applicationStatus,
    assignmentState,
    reviewStatus,
    eligibilityStatus,
    decisionStatus,
    issuanceStatus,
    decisionOutcome,
  });

  return (
    <div
      className={cn(
        "rounded-lg border border-brand/30 bg-brand/5 px-3 py-2",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand">
        <GitBranch className="h-3.5 w-3.5" aria-hidden />
        Tok certifikacije (ISO/IEC 17024)
      </div>
      <StageContent stage={stage} />
      <p className="mt-2 text-[11px] text-text-muted" data-testid="cert-workflow-boundary-note">
        Edukacija ≠ certifikacija · Pregled prihvatljivosti ≠ odluka · Izdano (ISSUED) ≠ aktivno (ACTIVE)
      </p>
    </div>
  );
}
