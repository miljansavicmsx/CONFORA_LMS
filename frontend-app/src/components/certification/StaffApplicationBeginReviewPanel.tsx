import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CERTIFICATION_STAFF_NS } from "@confora/i18n";
import { AlertCircle, ClipboardList, Loader2, PlayCircle } from "lucide-react";
import { useCallback, useMemo, useState, type JSX } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  mapStaffBeginReviewError,
  startApplicationReview,
  type ApplicationReviewStatusResponse,
  type ReviewState,
} from "@/lib/api-staff-cert-begin-review";
import type { ApplicationAssignmentResponse } from "@/lib/api-staff-cert-assignment";
import {
  canReadReviewStatusPanel,
  canShowStartReviewAction,
} from "@/lib/certification-begin-review-access";
import { resolvePublicAssignmentState } from "@/lib/certification-assignment-access";
import { cn } from "@/lib/utils";

const CERT_APPLICATIONS_KEY = ["certification", "applications", "staff"] as const;

export type StaffApplicationBeginReviewPanelProps = {
  readonly applicationId: string;
  readonly applicationStatus: string;
  readonly reviewStatus: ApplicationReviewStatusResponse | undefined;
  readonly assignment: ApplicationAssignmentResponse | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly nestRoles: readonly string[];
  readonly currentUserId: string | null;
};

function formatReviewTimestamp(iso: string | null | undefined, locale: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function ReviewStateBadge({
  state,
  label,
}: {
  readonly state: ReviewState;
  readonly label: string;
}): JSX.Element {
  const tone =
    state === "IN_PROGRESS"
      ? "border-sky-500/40 bg-sky-500/10 text-sky-100"
      : "border-border/60 bg-surface-primary/80 text-text-secondary";

  return (
    <span
      className={cn("inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium", tone)}
      aria-live="polite"
    >
      {label}
    </span>
  );
}

export function StaffApplicationBeginReviewPanel({
  applicationId,
  applicationStatus,
  reviewStatus,
  assignment,
  isLoading,
  isError,
  nestRoles,
  currentUserId,
}: StaffApplicationBeginReviewPanelProps): JSX.Element | null {
  const { t, i18n } = useTranslation(CERTIFICATION_STAFF_NS);
  const queryClient = useQueryClient();

  const [actionErrorKey, setActionErrorKey] = useState<string | null>(null);
  const [successKey, setSuccessKey] = useState<string | null>(null);

  const canReadPanel = canReadReviewStatusPanel(nestRoles);
  const assignmentStatus =
    assignment?.current?.status ?? reviewStatus?.assignmentStatus ?? null;
  const assigneeReference =
    assignment?.current?.assigneeReference ?? reviewStatus?.assigneeReference ?? null;
  const reviewState: ReviewState = reviewStatus?.reviewState ?? "NOT_STARTED";
  const displayApplicationStatus =
    reviewStatus?.applicationStatus ?? applicationStatus;
  const publicAssignmentState = resolvePublicAssignmentState(
    assignmentStatus ? { status: assignmentStatus } : assignment?.current,
  );

  const showStartReview = canShowStartReviewAction({
    applicationStatus: displayApplicationStatus,
    assignmentStatus,
    assigneeReference,
    nestRoles,
    currentUserId,
  });

  const reviewStateLabels = useMemo(
    () => ({
      NOT_STARTED: t("review.status.notStarted"),
      IN_PROGRESS: t("review.status.inProgress"),
    }),
    [t],
  );

  const assignmentStatusLabels = useMemo(
    () => ({
      UNASSIGNED: t("assignment.status.unassigned"),
      ASSIGNED: t("assignment.status.assigned"),
      ACCEPTED: t("assignment.status.accepted"),
      IN_REVIEW: t("assignment.status.inReview"),
      DECLINED: t("assignment.status.declined"),
      REASSIGNED: t("assignment.status.reassigned"),
    }),
    [t],
  );

  const invalidateAfterStart = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [...CERT_APPLICATIONS_KEY, "review", applicationId],
    });
    await queryClient.invalidateQueries({
      queryKey: [...CERT_APPLICATIONS_KEY, "assignment", applicationId],
    });
    await queryClient.invalidateQueries({
      queryKey: [...CERT_APPLICATIONS_KEY, "detail", applicationId],
    });
    await queryClient.invalidateQueries({ queryKey: CERT_APPLICATIONS_KEY });
  }, [applicationId, queryClient]);

  const startMutation = useMutation({
    mutationFn: () => startApplicationReview(applicationId),
    onSuccess: async () => {
      setActionErrorKey(null);
      setSuccessKey("review.success.started");
      await invalidateAfterStart();
    },
    onError: (error: unknown) => {
      const mapped = mapStaffBeginReviewError(error);
      setSuccessKey(null);
      setActionErrorKey(mapped.messageKey);
    },
  });

  const handleStartReview = useCallback(() => {
    setActionErrorKey(null);
    setSuccessKey(null);
    startMutation.mutate();
  }, [startMutation]);

  if (!canReadPanel && !showStartReview) {
    return null;
  }

  return (
    <section
      className="rounded-xl border border-border/50 bg-surface-primary/50 p-4"
      aria-labelledby="staff-begin-review-panel-title"
    >
      <div className="mb-3 flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-brand" aria-hidden />
        <h3 id="staff-begin-review-panel-title" className="text-sm font-semibold text-text-primary">
          {t("review.panelTitle")}
        </h3>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden />
          {t("review.loading")}
        </div>
      ) : isError ? (
        <div
          className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{t("review.errors.notFound")}</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <ReviewStateBadge state={reviewState} label={reviewStateLabels[reviewState]} />
            <span className="text-sm text-text-secondary">
              {t("review.labels.applicationStatus")}:{" "}
              <span className="font-medium text-text-primary">{displayApplicationStatus}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
            <span>
              {t("review.labels.assignmentStatus")}:{" "}
              <span className="font-medium text-text-primary">
                {assignmentStatusLabels[publicAssignmentState]}
              </span>
            </span>
          </div>

          {reviewState === "IN_PROGRESS" && reviewStatus?.reviewStartedAt ? (
            <p className="text-xs text-text-muted">
              {t("review.labels.reviewStartedAt")}:{" "}
              {formatReviewTimestamp(reviewStatus.reviewStartedAt, i18n.language)}
            </p>
          ) : null}

          {showStartReview ? (
            <div className="rounded-lg border border-border/40 p-3">
              <Button
                type="button"
                size="sm"
                className="bg-brand text-white hover:bg-brand/90"
                disabled={startMutation.isPending}
                onClick={handleStartReview}
              >
                {startMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    …
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" aria-hidden />
                    {t("review.actions.start")}
                  </>
                )}
              </Button>
            </div>
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
