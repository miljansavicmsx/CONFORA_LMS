/**
 * Kandidat — status certifikacije (tok odbora, odbijanje, žalba).
 */

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CircleDot, Gavel, Loader2, Lock, Shield } from "lucide-react";
import { useMemo, useState, type JSX } from "react";
import { Link, useSearchParams } from "react-router";

import { CertificationAppealDialog } from "@/components/grievances/CertificationAppealDialog";
import { CertificationLexiconBanner } from "@/components/learner/CertificationLexiconBanner";
import { CandidateApplicationNextStep } from "@/components/learner/CandidateApplicationNextStep";
import { Button } from "@/components/ui/button";
import {
  fetchMyCertificationApplications,
  type CertificationApplicationItem,
} from "@/lib/api-governance";
import { formatInternalIdSecondary, learnerApplicationTimelineLabel } from "@/lib/learner-polish-labels";
import { isRejectedApplication, isUnderCommitteeReview, statusLabelHr } from "@/lib/candidate-certification";
import { LEARNER_ISSUED_ACTIVE_BOUNDARY } from "@/lib/learner-flow-labels";
import { cn } from "@/lib/utils";

const QUERY_KEY = ["certification", "my-applications"] as const;

function PipelineCard({
  app,
  onOpenAppeal,
}: {
  readonly app: CertificationApplicationItem;
  readonly onOpenAppeal: (certificationDecisionId: string) => void;
}): JSX.Element {
  const inReview = isUnderCommitteeReview(app);
  const rejected = isRejectedApplication(app);
  const canFormalAppeal =
    Boolean(app.appealEligible && app.certificationDecisionId?.trim()) ||
    (rejected && Boolean(app.certificationDecisionId?.trim()));
  const decisionPhase =
    rejected ||
    app.status === "ELIGIBLE_FOR_DECISION" ||
    app.status === "APPROVED" ||
    app.status === "REJECTED_AFTER_DECISION";

  return (
    <article className="rounded-2xl border border-border/50 bg-surface-secondary/35 p-6 ring-1 ring-white/[0.04]">
      <header className="flex flex-col gap-2 border-b border-border/30 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs text-text-muted">
            Interni ID: {formatInternalIdSecondary(app.applicationId)}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Program:{" "}
            <span className="font-medium text-text-primary">
              {app.schemeTitle?.trim() || formatInternalIdSecondary(app.courseId)}
            </span>
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          {statusLabelHr(app.status)}
        </span>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {(
          [
            { key: "a", label: "Prijava", active: app.status !== "DRAFT" },
            { key: "b", label: "Pregled", active: inReview || ["PENDING_REVIEW", "UNDER_REVIEW"].includes(app.status) },
            { key: "c", label: "Odluka", active: decisionPhase },
            { key: "d", label: "Certifikat", active: app.status === "APPROVED" },
          ] as const
        ).map((step) => (
          <div
            key={step.key}
            className={cn(
              "rounded-xl border px-3 py-3 text-center text-xs font-medium",
              step.active
                ? "border-brand/40 bg-brand/10 text-brand"
                : "border-border/40 bg-surface-primary/40 text-text-muted",
            )}
          >
            {step.label}
          </div>
        ))}
      </div>

      {inReview ? (
        <div className="mt-4 flex gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>Prijava je zaključana za uređivanje tijekom aktivnog odborskog pregleda.</span>
        </div>
      ) : null}

      {Array.isArray(app.timeline) && app.timeline.length > 0 ? (
        <div className="mt-6 border-t border-border/30 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Vremenska crta</p>
          <ol className="mt-3 space-y-2 border-l border-border/50 pl-4">
            {app.timeline.map((ev) => (
              <li key={`${ev.at}-${ev.toStatus}`} className="relative text-sm text-text-secondary">
                <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand" aria-hidden />
                <span className="font-mono text-xs text-text-muted">{new Date(ev.at).toLocaleString()}</span>
                {ev.label ? <span className="mt-0.5 block text-text-primary">{ev.label}</span> : null}
                {ev.toStatus ? (
                  <span className="block text-xs text-text-muted">
                    {learnerApplicationTimelineLabel(ev.toStatus)}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {rejected ? (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" aria-hidden />
            <div className="min-w-0 space-y-2">
              <p className="font-semibold text-red-100">Odluka nije povoljna</p>
              {app.decisionComment?.trim() ? (
                <p className="text-sm leading-relaxed text-red-100/90">{app.decisionComment.trim()}</p>
              ) : (
                <p className="text-sm text-red-200/80">Razlog će biti dostupan u službenom obavještenju.</p>
              )}
              <p className="text-xs text-red-200/70">
                Imate pravo na žalbu u skladu s pravilnikom. Ne šaljite osobne podatke javno.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="secondary" className="border-border/60" asChild>
                  <Link to="/dashboard/iso/complaints">Modul 9 — žalbe i pritužbe</Link>
                </Button>
                {canFormalAppeal && app.certificationDecisionId ? (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-amber-600 text-white hover:bg-amber-600/90"
                    onClick={() => onOpenAppeal(app.certificationDecisionId!)}
                  >
                    Formalna žalba na odluku
                  </Button>
                ) : null}
                <Button type="button" size="sm" variant="secondary" className="border-border/60" asChild>
                  <Link to="/dashboard/support">Podrška i kontakt</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {(app.status === "ELIGIBLE_FOR_DECISION" || app.status === "APPROVED") && !rejected ? (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          <div className="flex flex-wrap items-center gap-3">
            <Shield className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden />
            <span>
              {app.status === "APPROVED"
                ? "Odluka je pozitivna — certifikat je ili u izdanju ili vidljiv u „Moji dokumenti“."
                : "Prijava je prihvaćena za odluku odbora — sljedeći korak je formalno izdanje certifikata."}
            </span>
          </div>
          <Button type="button" size="sm" variant="secondary" className="w-fit bg-surface-primary/80" asChild>
            <Link to="/dashboard/my-certificates">Moji dokumenti</Link>
          </Button>
        </div>
      ) : null}

      <CandidateApplicationNextStep status={app.status} />

      <p className="mt-3 text-[11px] text-text-muted" data-testid="learner-cert-status-boundary">
        {LEARNER_ISSUED_ACTIVE_BOUNDARY} Javna provjera je samo za čitanje.
      </p>
    </article>
  );
}

export default function CertificationStatusPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const focusApplicationId = searchParams.get("applicationId")?.trim() ?? null;
  const [appealOpen, setAppealOpen] = useState(false);
  const [appealDecisionId, setAppealDecisionId] = useState<string | null>(null);

  const { data = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchMyCertificationApplications,
  });

  const visibleApps = useMemo(() => {
    if (!focusApplicationId) {
      return data;
    }
    const match = data.filter((a) => a.applicationId === focusApplicationId);
    return match.length > 0 ? match : data;
  }, [data, focusApplicationId]);

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
              <Gavel className="h-6 w-6 text-brand" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Status certifikacije</h1>
              <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                Pregled toka od prijave do odluke. Ovo je{" "}
                <span className="font-medium text-text-primary">odvojeno</span> od potvrde o polaganju ispita u tečaju.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-border/60"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Osvježi
          </Button>
        </header>

        <CertificationLexiconBanner variant="compact" />

        {isLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center gap-2 text-text-secondary">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            Učitavanje…
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
            Status nije učitan.
          </div>
        ) : null}

        {!isLoading && !isError && data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-surface-secondary/30 px-6 py-12 text-center">
            <CircleDot className="mx-auto h-10 w-10 text-text-muted" aria-hidden />
            <p className="mt-4 text-text-secondary">Nema prijava za prikaz statusa.</p>
            <Button type="button" className="mt-6 bg-brand text-white hover:bg-brand/90" asChild>
              <Link to="/dashboard/certification/applications">Prijave za certifikaciju</Link>
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && data.length > 0 ? (
          <div className="space-y-8" data-testid="learner-cert-status-list">
            {focusApplicationId && visibleApps.length === 1 ? (
              <p className="text-sm text-text-secondary" data-testid="learner-cert-status-focused">
                Prikaz statusa za odabranu prijavu.
              </p>
            ) : null}
            {visibleApps.map((app) => (
              <PipelineCard
                key={app.applicationId}
                app={app}
                onOpenAppeal={(did) => {
                  setAppealDecisionId(did);
                  setAppealOpen(true);
                }}
              />
            ))}
          </div>
        ) : null}
      </div>

      {appealDecisionId ? (
        <CertificationAppealDialog
          open={appealOpen}
          onOpenChange={(o) => {
            setAppealOpen(o);
            if (!o) {
              setAppealDecisionId(null);
            }
          }}
          certificationDecisionId={appealDecisionId}
          onSuccess={() => void refetch()}
        />
      ) : null}
    </div>
  );
}
