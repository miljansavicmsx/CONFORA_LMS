import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Gavel, Loader2, PlayCircle, Users } from "lucide-react";
import { useCallback, useMemo, useState, type JSX } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { EligibilityReviewResponse } from "@/lib/api-staff-cert-eligibility";
import {
  fetchCertificationDecision,
  fetchCertificationDecisionValidation,
  mapStaffDecisionError,
  recordCertificationDecisionOutcome,
  startCertificationDecisionReview,
  type CertificationDecisionResponse,
  type CertificationDecisionValidationDetail,
} from "@/lib/api-staff-cert-decision";
import {
  canFinalizeDecisionOutcome,
  canReadDecisionPanel,
  canRecordDecisionOutcome,
  canStartDecisionReview,
  evaluateQuorumFinalizeState,
  isDirectorGovernanceOnlyDecisionView,
} from "@/lib/certification-decision-access";
import { decisionOutcomeLabel, decisionReviewStatusLabel } from "@/lib/certification-ops-labels";
import { cn } from "@/lib/utils";

const CERT_APPLICATIONS_KEY = ["certification", "applications", "staff"] as const;

export type StaffCertificationDecisionPanelProps = {
  readonly applicationId: string;
  readonly decision: CertificationDecisionResponse | undefined;
  readonly eligibility: EligibilityReviewResponse | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly nestRoles: readonly string[];
};

function StatusBadge({ status }: { readonly status: string }): JSX.Element {
  const tone =
    status === "DECIDED"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
      : status === "IN_REVIEW"
        ? "border-sky-500/40 bg-sky-500/10 text-sky-100"
        : "border-border/60 bg-surface-primary/80 text-text-secondary";
  return (
    <span
      className={cn("inline-flex rounded-md border px-2.5 py-1 text-xs font-medium", tone)}
      data-testid="decision-status-badge"
    >
      {decisionReviewStatusLabel(status)}
    </span>
  );
}

function quorumBlockedMessage(
  blockedReason: ReturnType<typeof evaluateQuorumFinalizeState>["blockedReason"],
): string {
  if (blockedReason === "quorum_insufficient") {
    return "Kvorum nije postignut — potrebno je više članova odbora prije finalizacije odluke.";
  }
  if (blockedReason === "quorum_missing") {
    return "Nedostaje dokaz o kvorumu — članovi COM_CERT moraju potvrditi proces prije finalizacije.";
  }
  return "Finalizacija odluke nije dostupna u trenutnom stanju pregleda.";
}

function QuorumStatusPanel({
  validation,
  governanceOnly,
}: {
  readonly validation: CertificationDecisionValidationDetail | null | undefined;
  readonly governanceOnly: boolean;
}): JSX.Element {
  const required = validation?.requiredQuorum ?? 3;
  const participating = validation?.quorumCount ?? 0;
  const satisfied = validation?.quorumConfirmed === true && participating >= required;

  return (
    <div
      className="mb-3 rounded-lg border border-border/40 bg-surface-secondary/30 px-3 py-2"
      data-testid="decision-quorum-status"
    >
      <div className="mb-1 flex items-center gap-2 text-xs font-medium text-text-primary">
        <Users className="h-3.5 w-3.5 text-brand" aria-hidden />
        Status kvoruma (BR-06)
      </div>
      <p className="text-xs text-text-secondary">
        Potrebno: <span className="font-medium text-text-primary">{required}</span> · Sudjeluje:{" "}
        <span className="font-medium text-text-primary">{participating}</span> ·{" "}
        <span
          data-testid="decision-quorum-satisfied"
          className={cn("font-medium", satisfied ? "text-emerald-300" : "text-amber-300")}
        >
          {satisfied ? "Kvorum zadovoljen" : "Kvorum nije zadovoljen"}
        </span>
      </p>
      {governanceOnly ? (
        <p className="mt-1 text-xs text-text-muted" data-testid="decision-quorum-governance-note">
          Pregled nadzora (D-01) — samo čitanje; direktor ne finalizira odluku.
        </p>
      ) : null}
      {!satisfied ? (
        <p className="mt-1 text-xs text-amber-200/90" data-testid="decision-quorum-blocked-reason">
          {quorumBlockedMessage(
            participating > 0 ? "quorum_insufficient" : "quorum_missing",
          )}
        </p>
      ) : null}
    </div>
  );
}

export function StaffCertificationDecisionPanel({
  applicationId,
  decision,
  eligibility,
  isLoading,
  isError,
  nestRoles,
}: StaffCertificationDecisionPanelProps): JSX.Element | null {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const canRead = canReadDecisionPanel(nestRoles);
  const canStart = canStartDecisionReview(nestRoles);
  const canOutcome = canRecordDecisionOutcome(nestRoles);
  const governanceOnly = isDirectorGovernanceOnlyDecisionView(nestRoles);

  const reviewStatus = decision?.certificationDecisionReview?.status ?? "NOT_STARTED";
  const outcome = decision?.certificationDecisionReview?.outcome ?? null;

  const validationQuery = useQuery({
    queryKey: [...CERT_APPLICATIONS_KEY, "decision-validation", applicationId],
    queryFn: () => fetchCertificationDecisionValidation(applicationId),
    enabled: canRead && reviewStatus !== "NOT_STARTED",
  });

  const validation = validationQuery.data?.certificationDecisionValidation ?? null;
  const quorumState = useMemo(
    () => evaluateQuorumFinalizeState(reviewStatus, validation),
    [reviewStatus, validation],
  );
  const finalizeAllowed = canFinalizeDecisionOutcome(nestRoles, reviewStatus, validation);

  const invalidate = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [...CERT_APPLICATIONS_KEY, "decision", applicationId],
      }),
      queryClient.invalidateQueries({
        queryKey: [...CERT_APPLICATIONS_KEY, "decision-validation", applicationId],
      }),
    ]);
  }, [applicationId, queryClient]);

  const startMutation = useMutation({
    mutationFn: () => startCertificationDecisionReview(applicationId),
    onSuccess: async () => {
      setActionError(null);
      await invalidate();
    },
    onError: (e: unknown) => setActionError(mapStaffDecisionError(e).messageKey),
  });

  const outcomeMutation = useMutation({
    mutationFn: (out: "CERTIFICATION_APPROVED" | "CERTIFICATION_DENIED") =>
      recordCertificationDecisionOutcome(applicationId, {
        outcome: out,
        reason: reason.trim() || undefined,
      }),
    onSuccess: async () => {
      setActionError(null);
      await invalidate();
    },
    onError: (e: unknown) => setActionError(mapStaffDecisionError(e).messageKey),
  });

  const eligibilityRec = useMemo(
    () => eligibility?.recommendation?.value ?? null,
    [eligibility?.recommendation?.value],
  );

  if (!canRead) return null;

  return (
    <section
      className="rounded-xl border border-border/50 bg-surface-primary/50 p-4"
      data-testid="staff-decision-panel"
    >
      <div className="mb-3 flex items-center gap-2">
        <Gavel className="h-4 w-4 text-brand" aria-hidden />
        <h3 className="text-sm font-semibold text-text-primary">Odluka o certifikaciji (B10)</h3>
      </div>

      <p className="mb-3 text-xs text-text-muted" data-testid="decision-boundary-note">
        Preporuka podobnosti (eligibility) nije odluka o certifikaciji. Odluka ne izdaje certifikat.
      </p>

      {governanceOnly ? (
        <p
          className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-text-secondary"
          data-testid="decision-governance-only-banner"
        >
          Pregled nadzora (D-01) — direktor ne finalizira individualnu certifikacijsku odluku. Odluku
          donosi ovlašteno certifikacijsko tijelo (COM_CERT) uz zadovoljen kvorum.
        </p>
      ) : null}

      <p className="mb-3 text-xs text-text-secondary" data-testid="decision-committee-context">
        Odlučivački kontekst (uloge):{" "}
        <span className="font-medium text-text-primary">
          {nestRoles.length > 0 ? nestRoles.join(", ") : "—"}
        </span>
        . Finalizacija zahtijeva dokaz o kvorumu COM_CERT odbora (BR-06).
      </p>

      {reviewStatus !== "NOT_STARTED" ? (
        <QuorumStatusPanel validation={validation} governanceOnly={governanceOnly} />
      ) : null}

      <fieldset
        className="mb-3 rounded-lg border border-border/40 bg-surface-secondary/30 px-3 py-2"
        data-testid="decision-eligibility-readonly"
      >
        <legend className="px-1 text-xs font-medium text-text-muted">Eligibility preporuka (samo čitanje)</legend>
        <p className="text-xs text-text-secondary" data-testid="decision-eligibility-ref">
          {eligibilityRec ? (
            <>
              Preporuka: <span className="font-medium text-text-primary">{eligibilityRec}</span>
            </>
          ) : (
            "Nema eligibility preporuke za referencu — operator odlučuje neovisno."
          )}
        </p>
      </fieldset>

      {decision?.certificationDecisionReview?.reason ? (
        <p className="mb-3 text-xs text-text-secondary" data-testid="decision-evidence-notes">
          Bilješka odluke:{" "}
          <span className="text-text-primary">{decision.certificationDecisionReview.reason}</span>
        </p>
      ) : null}

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden />
          Učitavanje odluke…
        </div>
      ) : isError ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Odluka nije dostupna za ovu prijavu.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={reviewStatus} />
            {outcome ? (
              <span className="text-xs text-text-secondary" data-testid="decision-outcome">
                Ishod: <span className="font-medium text-text-primary">{decisionOutcomeLabel(outcome)}</span>
              </span>
            ) : null}
          </div>

          {canStart && reviewStatus === "NOT_STARTED" ? (
            <Button
              type="button"
              size="sm"
              disabled={startMutation.isPending}
              onClick={() => startMutation.mutate()}
              data-testid="decision-start-button"
            >
              {startMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <PlayCircle className="mr-2 h-4 w-4" aria-hidden />
              )}
              Započni pregled odluke
            </Button>
          ) : null}

          {canOutcome && reviewStatus === "IN_REVIEW" ? (
            <div className="space-y-2 rounded-lg border border-border/40 p-3">
              <Label htmlFor="decision-reason" className="text-xs text-text-secondary">
                Obrazloženje odluke
              </Label>
              <textarea
                id="decision-reason"
                rows={2}
                className="w-full rounded-md border border-border/60 bg-surface-primary px-2 py-1 text-xs text-text-primary"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                data-testid="decision-reason-input"
              />
              {!finalizeAllowed && quorumState.blockedReason ? (
                <p
                  className="text-xs text-amber-200/90"
                  data-testid="decision-finalize-blocked-reason"
                >
                  {quorumBlockedMessage(quorumState.blockedReason)}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={outcomeMutation.isPending || !finalizeAllowed}
                  onClick={() => outcomeMutation.mutate("CERTIFICATION_APPROVED")}
                  data-testid="decision-approve-button"
                >
                  Odobri certifikaciju
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-red-500/40 text-red-200"
                  disabled={outcomeMutation.isPending || !finalizeAllowed}
                  onClick={() => outcomeMutation.mutate("CERTIFICATION_DENIED")}
                  data-testid="decision-deny-button"
                >
                  Odbij certifikaciju
                </Button>
              </div>
            </div>
          ) : null}

          {actionError ? (
            <p className="text-sm text-red-400" role="alert">
              {actionError}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

export { fetchCertificationDecision };
