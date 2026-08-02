import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CERTIFICATION_STAFF_NS } from "@confora/i18n";
import { AlertCircle, CheckCircle2, ClipboardCheck, Loader2, PlayCircle } from "lucide-react";
import { useCallback, useMemo, useState, type JSX } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ApplicationAssignmentResponse } from "@/lib/api-staff-cert-assignment";
import {
  fetchApplicationEligibility,
  mapStaffEligibilityError,
  startEligibilityReview,
  updateEligibilityCriterion,
  type EligibilityCriterionItem,
  type EligibilityCriterionStatus,
  type EligibilityReviewResponse,
  type EligibilityReviewStatus,
} from "@/lib/api-staff-cert-eligibility";
import {
  canReadEligibilityPanel,
  canShowStartEligibilityAction,
  canUpdateEligibilityCriteria,
} from "@/lib/certification-eligibility-access";
import { cn } from "@/lib/utils";

const CERT_APPLICATIONS_KEY = ["certification", "applications", "staff"] as const;

export type StaffEligibilityCriteriaPanelProps = {
  readonly applicationId: string;
  readonly applicationStatus: string;
  readonly eligibility: EligibilityReviewResponse | undefined;
  readonly assignment: ApplicationAssignmentResponse | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly nestRoles: readonly string[];
  readonly currentUserId: string | null;
};

function EligibilityStatusBadge({
  status,
  label,
}: {
  readonly status: EligibilityReviewStatus;
  readonly label: string;
}): JSX.Element {
  const tone =
    status === "COMPLETED"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
      : status === "IN_PROGRESS"
        ? "border-sky-500/40 bg-sky-500/10 text-sky-100"
        : "border-border/60 bg-surface-primary/80 text-text-secondary";

  return (
    <span
      className={cn("inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium", tone)}
      data-testid="eligibility-status-badge"
    >
      {label}
    </span>
  );
}

function CriterionRow({
  criterion,
  canEdit,
  onSave,
  isSaving,
}: {
  readonly criterion: EligibilityCriterionItem;
  readonly canEdit: boolean;
  readonly onSave: (code: string, status: EligibilityCriterionStatus, notes: string) => void;
  readonly isSaving: boolean;
}): JSX.Element {
  const [status, setStatus] = useState<EligibilityCriterionStatus>(criterion.status);
  const [notes, setNotes] = useState(criterion.reviewerNotes ?? "");

  return (
    <div
      className="rounded-lg border border-border/40 bg-surface-primary/60 p-3"
      data-testid={`eligibility-criterion-${criterion.criterionCode}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-text-primary">{criterion.criterionName}</p>
          <p className="font-mono text-xs text-text-muted">{criterion.criterionCode}</p>
        </div>
        {canEdit ? (
          <select
            aria-label={`Status ${criterion.criterionCode}`}
            className="rounded-md border border-border/60 bg-surface-primary px-2 py-1 text-xs text-text-primary"
            value={status}
            onChange={(e) => setStatus(e.target.value as EligibilityCriterionStatus)}
            data-testid={`eligibility-criterion-status-${criterion.criterionCode}`}
          >
            <option value="PENDING">PENDING</option>
            <option value="MET">MET</option>
            <option value="NOT_MET">NOT_MET</option>
            <option value="NOT_APPLICABLE">NOT_APPLICABLE</option>
          </select>
        ) : (
          <span className="text-xs font-medium text-text-secondary">{criterion.status}</span>
        )}
      </div>
      {canEdit ? (
        <div className="mt-2 space-y-2">
          <Label className="text-xs text-text-secondary">Napomene recenzenta</Label>
          <textarea
            rows={2}
            className="w-full resize-y rounded-md border border-border/60 bg-surface-primary px-2 py-1 text-xs text-text-primary"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            data-testid={`eligibility-criterion-notes-${criterion.criterionCode}`}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isSaving}
            onClick={() => onSave(criterion.criterionCode, status, notes)}
            data-testid={`eligibility-criterion-save-${criterion.criterionCode}`}
          >
            {isSaving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
            Spremi kriterij
          </Button>
        </div>
      ) : criterion.reviewerNotes ? (
        <p className="mt-2 text-xs text-text-secondary">{criterion.reviewerNotes}</p>
      ) : null}
    </div>
  );
}

export function StaffEligibilityCriteriaPanel({
  applicationId,
  applicationStatus,
  eligibility,
  assignment,
  isLoading,
  isError,
  nestRoles,
  currentUserId,
}: StaffEligibilityCriteriaPanelProps): JSX.Element | null {
  const { t } = useTranslation(CERTIFICATION_STAFF_NS);
  const queryClient = useQueryClient();
  const [actionErrorKey, setActionErrorKey] = useState<string | null>(null);
  const [successKey, setSuccessKey] = useState<string | null>(null);
  const [savingCode, setSavingCode] = useState<string | null>(null);

  const assignmentStatus = assignment?.current?.status ?? null;
  const assigneeReference = assignment?.current?.assigneeReference ?? null;
  const eligibilityStatus: EligibilityReviewStatus = eligibility?.eligibilityStatus ?? "NOT_STARTED";
  const displayApplicationStatus = eligibility?.applicationStatus ?? applicationStatus;

  const visibilityInput = useMemo(
    () => ({
      applicationStatus: displayApplicationStatus,
      assignmentStatus,
      assigneeReference,
      eligibilityStatus,
      nestRoles,
      currentUserId,
    }),
    [assigneeReference, assignmentStatus, currentUserId, displayApplicationStatus, eligibilityStatus, nestRoles],
  );

  const canReadPanel = canReadEligibilityPanel(nestRoles);
  const showStart = canShowStartEligibilityAction(visibilityInput);
  const canEditCriteria = canUpdateEligibilityCriteria(visibilityInput);

  const statusLabels = useMemo(
    () => ({
      NOT_STARTED: t("eligibility.status.notStarted"),
      IN_PROGRESS: t("eligibility.status.inProgress"),
      COMPLETED: t("eligibility.status.completed"),
    }),
    [t],
  );

  const invalidateEligibility = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [...CERT_APPLICATIONS_KEY, "eligibility", applicationId],
    });
    await queryClient.invalidateQueries({
      queryKey: [...CERT_APPLICATIONS_KEY, "detail", applicationId],
    });
  }, [applicationId, queryClient]);

  const startMutation = useMutation({
    mutationFn: () => startEligibilityReview(applicationId),
    onSuccess: async () => {
      setActionErrorKey(null);
      setSuccessKey("eligibility.success.started");
      await invalidateEligibility();
    },
    onError: (error: unknown) => {
      setSuccessKey(null);
      setActionErrorKey(mapStaffEligibilityError(error).messageKey);
    },
  });

  const criterionMutation = useMutation({
    mutationFn: ({
      code,
      status,
      notes,
    }: {
      code: string;
      status: EligibilityCriterionStatus;
      notes: string;
    }) =>
      updateEligibilityCriterion(applicationId, code, {
        status,
        reviewerNotes: notes.trim() || null,
      }),
    onMutate: ({ code }) => setSavingCode(code),
    onSettled: () => setSavingCode(null),
    onSuccess: async () => {
      setActionErrorKey(null);
      setSuccessKey("eligibility.success.criterionUpdated");
      await invalidateEligibility();
    },
    onError: (error: unknown) => {
      setSuccessKey(null);
      setActionErrorKey(mapStaffEligibilityError(error).messageKey);
    },
  });

  if (!canReadPanel && !showStart) {
    return null;
  }

  return (
    <section
      className="rounded-xl border border-border/50 bg-surface-primary/50 p-4"
      aria-labelledby="staff-eligibility-panel-title"
      data-testid="staff-eligibility-panel"
    >
      <div className="mb-3 flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4 text-brand" aria-hidden />
        <h3 id="staff-eligibility-panel-title" className="text-sm font-semibold text-text-primary">
          {t("eligibility.panelTitle")}
        </h3>
      </div>

      <p className="mb-3 text-xs text-text-muted">{t("eligibility.boundaryNote")}</p>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden />
          {t("eligibility.loading")}
        </div>
      ) : isError ? (
        <div
          className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{t("eligibility.errors.notFound")}</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <EligibilityStatusBadge status={eligibilityStatus} label={statusLabels[eligibilityStatus]} />
            {eligibility?.recommendation ? (
              <span className="text-xs text-text-secondary">
                {t("eligibility.labels.recommendation")}:{" "}
                <span className="font-medium text-text-primary">{eligibility.recommendation.value}</span>
              </span>
            ) : null}
          </div>

          {showStart ? (
            <div className="rounded-lg border border-border/40 p-3">
              <Button
                type="button"
                size="sm"
                className="bg-brand text-white hover:bg-brand/90"
                disabled={startMutation.isPending}
                onClick={() => startMutation.mutate()}
                data-testid="eligibility-start-button"
              >
                {startMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <PlayCircle className="mr-2 h-4 w-4" aria-hidden />
                )}
                {t("eligibility.actions.start")}
              </Button>
            </div>
          ) : null}

          {eligibility?.criteria && eligibility.criteria.length > 0 ? (
            <div className="space-y-3" data-testid="eligibility-criteria-list">
              {eligibility.criteria.map((c) => (
                <CriterionRow
                  key={c.criterionCode}
                  criterion={c}
                  canEdit={canEditCriteria && eligibilityStatus === "IN_PROGRESS"}
                  isSaving={savingCode === c.criterionCode && criterionMutation.isPending}
                  onSave={(code, status, notes) => criterionMutation.mutate({ code, status, notes })}
                />
              ))}
            </div>
          ) : eligibilityStatus === "NOT_STARTED" ? (
            <p className="text-sm text-text-muted">{t("eligibility.hints.startFirst")}</p>
          ) : null}

          {eligibilityStatus === "COMPLETED" ? (
            <p className="flex items-center gap-2 text-sm text-emerald-200/90" role="status">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              {t("eligibility.success.completed")}
            </p>
          ) : null}

          {actionErrorKey ? (
            <p className="text-sm text-red-400" role="alert">
              {t(actionErrorKey)}
            </p>
          ) : null}

          {successKey ? (
            <p className="text-sm text-emerald-300" role="status">
              {t(successKey)}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

/** Prefetch helper for tests — exported for consistency with other staff API modules. */
export { fetchApplicationEligibility };
