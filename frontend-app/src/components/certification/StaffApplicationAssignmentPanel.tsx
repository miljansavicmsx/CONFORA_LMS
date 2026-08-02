import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CERTIFICATION_STAFF_NS } from "@confora/i18n";
import { AlertCircle, CheckCircle2, Loader2, UserCheck } from "lucide-react";
import { useCallback, useMemo, useState, type JSX } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  acceptApplicationAssignment,
  assignApplicationReviewer,
  declineApplicationAssignment,
  mapStaffAssignmentError,
  type ApplicationAssignmentResponse,
  type ReviewAssignmentItem,
} from "@/lib/api-staff-cert-assignment";
import {
  canPerformReviewerAcceptDecline,
  canReadAssignmentPanel,
  canShowAssignmentCreatorActions,
  canViewDeclineReason,
  isCurrentUserAssignee,
  resolvePublicAssignmentState,
  type PublicAssignmentState,
} from "@/lib/certification-assignment-access";
import { cn } from "@/lib/utils";

const CERT_APPLICATIONS_KEY = ["certification", "applications", "staff"] as const;

export type StaffApplicationAssignmentPanelProps = {
  readonly applicationId: string;
  readonly assignment: ApplicationAssignmentResponse | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly nestRoles: readonly string[];
  readonly currentUserId: string | null;
};

function formatAssignedAt(iso: string | undefined, locale: string): string {
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

function StatusBadge({ state, label }: { readonly state: PublicAssignmentState; readonly label: string }): JSX.Element {
  const tone =
    state === "IN_REVIEW"
      ? "border-sky-500/40 bg-sky-500/10 text-sky-100"
      : state === "ACCEPTED"
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
        : state === "ASSIGNED"
          ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
          : state === "DECLINED"
            ? "border-red-500/40 bg-red-500/10 text-red-200"
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

function HistoryRow({
  item,
  showDeclineReason,
  locale,
  declineLabel,
  statusLabels,
}: {
  readonly item: ReviewAssignmentItem;
  readonly showDeclineReason: boolean;
  readonly locale: string;
  readonly declineLabel: string;
  readonly statusLabels: Record<string, string>;
}): JSX.Element {
  const statusKey = item.status.toUpperCase();
  return (
    <li className="rounded-md border border-border/40 bg-surface-primary/60 px-3 py-2 text-xs text-text-secondary">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-text-primary">
          {statusLabels[statusKey] ?? item.status}
        </span>
        <span>{formatAssignedAt(item.assignedAt, locale)}</span>
      </div>
      <p className="mt-1">
        {item.assigneeReference}
      </p>
      {showDeclineReason && item.declineReason ? (
        <p className="mt-1 text-text-muted">
          {declineLabel}: {item.declineReason}
        </p>
      ) : null}
    </li>
  );
}

export function StaffApplicationAssignmentPanel({
  applicationId,
  assignment,
  isLoading,
  isError,
  nestRoles,
  currentUserId,
}: StaffApplicationAssignmentPanelProps): JSX.Element | null {
  const { t, i18n } = useTranslation(CERTIFICATION_STAFF_NS);
  const queryClient = useQueryClient();

  const [reviewerId, setReviewerId] = useState("");
  const [rationale, setRationale] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [coiAccepted, setCoiAccepted] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [actionErrorKey, setActionErrorKey] = useState<string | null>(null);
  const [successKey, setSuccessKey] = useState<string | null>(null);

  const publicState = resolvePublicAssignmentState(assignment?.current);
  const canReadPanel = canReadAssignmentPanel(nestRoles);
  const showAssign = canShowAssignmentCreatorActions(nestRoles);
  const showReviewerActions =
    canPerformReviewerAcceptDecline(nestRoles) &&
    isCurrentUserAssignee(currentUserId, assignment?.current?.assigneeReference ?? null) &&
    publicState === "ASSIGNED";
  const showDeclineReason = canViewDeclineReason(nestRoles);

  const statusLabels = useMemo(
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

  const invalidateAssignment = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [...CERT_APPLICATIONS_KEY, "assignment", applicationId],
    });
    await queryClient.invalidateQueries({ queryKey: CERT_APPLICATIONS_KEY });
  }, [applicationId, queryClient]);

  const handleMutationError = useCallback((error: unknown) => {
    const mapped = mapStaffAssignmentError(error);
    const customKey =
      error &&
      typeof error === "object" &&
      "messageKey" in error &&
      typeof (error as { messageKey: unknown }).messageKey === "string"
        ? (error as { messageKey: string }).messageKey
        : null;
    setSuccessKey(null);
    setActionErrorKey(customKey ?? mapped.messageKey);
  }, []);

  const assignMutation = useMutation({
    mutationFn: () => assignApplicationReviewer(applicationId, reviewerId, rationale),
    onSuccess: async () => {
      setActionErrorKey(null);
      setSuccessKey("assignment.success.assigned");
      setReviewerId("");
      setRationale("");
      await invalidateAssignment();
    },
    onError: handleMutationError,
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptApplicationAssignment(applicationId),
    onSuccess: async () => {
      setActionErrorKey(null);
      setSuccessKey("assignment.success.accepted");
      setCoiAccepted(false);
      await invalidateAssignment();
    },
    onError: handleMutationError,
  });

  const declineMutation = useMutation({
    mutationFn: () => declineApplicationAssignment(applicationId, declineReason),
    onSuccess: async () => {
      setActionErrorKey(null);
      setSuccessKey("assignment.success.declined");
      setDeclineReason("");
      setShowDeclineForm(false);
      await invalidateAssignment();
    },
    onError: handleMutationError,
  });

  const handleAssign = useCallback(() => {
    setActionErrorKey(null);
    setSuccessKey(null);
    if (!reviewerId.trim()) {
      setActionErrorKey("assignment.errors.reviewerIdRequired");
      return;
    }
    assignMutation.mutate();
  }, [assignMutation, reviewerId]);

  const handleAccept = useCallback(() => {
    setActionErrorKey(null);
    setSuccessKey(null);
    if (!coiAccepted) {
      setActionErrorKey("assignment.errors.validation");
      return;
    }
    acceptMutation.mutate();
  }, [acceptMutation, coiAccepted]);

  const handleDecline = useCallback(() => {
    setActionErrorKey(null);
    setSuccessKey(null);
    if (declineReason.trim().length < 3) {
      setActionErrorKey("assignment.errors.declineReasonRequired");
      return;
    }
    declineMutation.mutate();
  }, [declineMutation, declineReason]);

  if (!canReadPanel && !showAssign && !showReviewerActions) {
    return null;
  }

  const latestDeclined = assignment?.history.find((h) => h.status === "DECLINED");

  return (
    <section
      className="rounded-xl border border-border/50 bg-surface-primary/50 p-4"
      aria-labelledby="staff-assignment-panel-title"
    >
      <div className="mb-3 flex items-center gap-2">
        <UserCheck className="h-4 w-4 text-brand" aria-hidden />
        <h3 id="staff-assignment-panel-title" className="text-sm font-semibold text-text-primary">
          {t("assignment.panelTitle")}
        </h3>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden />
          {t("assignment.loading")}
        </div>
      ) : isError ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{t("assignment.errors.notFound")}</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge state={publicState} label={statusLabels[publicState]} />
            {assignment?.current?.assigneeReference ? (
              <span className="text-sm text-text-secondary">
                {t("assignment.labels.assigneeReference")}:{" "}
                <span className="font-medium text-text-primary">{assignment.current.assigneeReference}</span>
              </span>
            ) : null}
          </div>

          {assignment?.current?.assignedAt ? (
            <p className="text-xs text-text-muted">
              {t("assignment.labels.assignedAt")}:{" "}
              {formatAssignedAt(assignment.current.assignedAt, i18n.language)}
            </p>
          ) : null}

          {showDeclineReason && latestDeclined?.declineReason && publicState === "UNASSIGNED" ? (
            <p className="text-sm text-text-secondary">
              {t("assignment.labels.declineReason")}: {latestDeclined.declineReason}
            </p>
          ) : null}

          {publicState === "ACCEPTED" && showReviewerActions === false && assignment?.current ? (
            <div className="flex items-center gap-2 text-sm text-emerald-200">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              {t("assignment.success.accepted")}
            </div>
          ) : null}

          {showAssign ? (
            <div className="space-y-3 rounded-lg border border-border/40 p-3">
              <div className="space-y-2">
                <Label htmlFor="assignment-reviewer-id" className="text-text-secondary">
                  {t("assignment.labels.reviewerId")}
                </Label>
                <Input
                  id="assignment-reviewer-id"
                  value={reviewerId}
                  onChange={(e) => setReviewerId(e.target.value)}
                  placeholder="b5200000-0000-4000-8000-000000000020"
                  className="border-border/60 bg-surface-primary text-text-primary"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment-rationale" className="text-text-secondary">
                  {t("assignment.labels.rationale")}
                </Label>
                <Input
                  id="assignment-rationale"
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  className="border-border/60 bg-surface-primary text-text-primary"
                />
              </div>
              <Button
                type="button"
                size="sm"
                className="bg-brand text-white hover:bg-brand/90"
                disabled={assignMutation.isPending}
                onClick={handleAssign}
              >
                {assignMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    …
                  </>
                ) : (
                  t("assignment.actions.assign")
                )}
              </Button>
            </div>
          ) : null}

          {showReviewerActions ? (
            <div className="space-y-3 rounded-lg border border-border/40 p-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="assignment-coi"
                  checked={coiAccepted}
                  onCheckedChange={(v) => setCoiAccepted(v === true)}
                />
                <Label htmlFor="assignment-coi" className="cursor-pointer text-sm font-normal text-text-primary">
                  {t("assignment.coi.declaration")}
                </Label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="bg-brand text-white hover:bg-brand/90"
                  disabled={acceptMutation.isPending}
                  onClick={handleAccept}
                >
                  {acceptMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("assignment.actions.accept")
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-border/60"
                  onClick={() => {
                    setShowDeclineForm((v) => !v);
                    setActionErrorKey(null);
                  }}
                >
                  {t("assignment.actions.decline")}
                </Button>
              </div>
              {showDeclineForm ? (
                <div className="space-y-2">
                  <Label htmlFor="assignment-decline-reason" className="text-text-secondary">
                    {t("assignment.labels.declineReason")}
                  </Label>
                  <textarea
                    id="assignment-decline-reason"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    rows={3}
                    className="w-full resize-y rounded-md border border-border/60 bg-surface-primary px-3 py-2 text-sm text-text-primary"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={declineMutation.isPending}
                    onClick={handleDecline}
                  >
                    {declineMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t("assignment.actions.submitDecline")
                    )}
                  </Button>
                </div>
              ) : null}
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

          {assignment && assignment.history.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                {t("assignment.labels.history")}
              </p>
              <ul className="space-y-2">
                {assignment.history.map((item) => (
                  <HistoryRow
                    key={item.assignmentId}
                    item={item}
                    showDeclineReason={showDeclineReason}
                    locale={i18n.language}
                    declineLabel={t("assignment.labels.declineReason")}
                    statusLabels={statusLabels}
                  />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
