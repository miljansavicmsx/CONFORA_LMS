/**
 * Kandidat — prijave za certifikaciju (backend-driven eligibility filtering).
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Loader2, Lock } from "lucide-react";
import { useMemo, useState, type JSX } from "react";
import { Link } from "react-router";

import { CertificationLexiconBanner } from "@/components/learner/CertificationLexiconBanner";
import { CandidateApplicationNextStep } from "@/components/learner/CandidateApplicationNextStep";
import { LearnerSupportEntryCard } from "@/components/learner/LearnerSupportEntryCard";
import { ContextRibbon } from "@/components/information-disclosure";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchMyCertificationEligibility } from "@/lib/api-cert-eligibility";
import {
  fetchMyCertificationApplications,
  postCertificationDraft,
  type CertificationApplicationItem,
} from "@/lib/api-governance";
import {
  candidateMayEditApplication,
  isTerminalCertificationApplicationStatus,
  isUnderCommitteeReview,
  statusLabelHr,
} from "@/lib/candidate-certification";
import {
  CERT_APPLY_FORM_PENDING_COPY,
  CERT_ELIGIBILITY_BOUNDARY_NOTICE,
  splitEligibilityItems,
  type LearnerCertEligibilityItem,
} from "@/lib/cert-eligibility-labels";
import {
  formatInternalIdSecondary,
  LEARNER_CERT_APPLICATION_NOTICE,
  learnerApplicationTimelineLabel,
} from "@/lib/learner-polish-labels";
import { IA_RIBBON_LEARNER_TRUST } from "@/lib/workspace-continuity";
import { cn } from "@/lib/utils";

const APPLICATIONS_KEY = ["certification", "my-applications"] as const;
const ELIGIBILITY_KEY = ["certification", "my-eligibility"] as const;

function ApplicationRow({ app }: { readonly app: CertificationApplicationItem }): JSX.Element {
  const lockedReview = isUnderCommitteeReview(app);
  const mayEdit = candidateMayEditApplication(app);
  const programmeTitle = app.schemeTitle?.trim() || app.desiredScopeText?.trim() || null;
  const statusPanelId = encodeURIComponent(app.applicationId);

  return (
    <li className="rounded-2xl border border-border/50 bg-surface-secondary/40 p-5 ring-1 ring-white/[0.04]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          {programmeTitle ? (
            <p className="text-base font-semibold text-text-primary">{programmeTitle}</p>
          ) : (
            <p className="text-sm text-text-secondary">Program certifikacije</p>
          )}
          <p className="font-mono text-[11px] text-text-muted">
            Interni ID prijave: {formatInternalIdSecondary(app.applicationId)}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="outline" className="border-brand/40 bg-brand/10 font-medium text-brand">
              {statusLabelHr(app.status)}
            </Badge>
            <span className="text-xs text-text-muted" data-testid={`learner-app-timeline-label-${app.applicationId}`}>
              {learnerApplicationTimelineLabel(app.status)}
            </span>
            {lockedReview ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-100">
                <Lock className="h-3.5 w-3.5" aria-hidden />
                Zaključano — aktivni odborski pregled
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {mayEdit ? (
            <Button type="button" variant="default" size="sm" className="bg-brand text-white hover:bg-brand/90" asChild>
              <Link to={`/dashboard/certification/applications/${encodeURIComponent(app.applicationId)}/wizard`}>
                Otvori čarobnjak
              </Link>
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="sm" className="border-border/60" asChild>
            <Link
              to={`/dashboard/certification/status?applicationId=${statusPanelId}`}
              data-testid={`learner-app-status-link-${app.applicationId}`}
            >
              Pogledaj status toka
            </Link>
          </Button>
        </div>
      </div>
      <CandidateApplicationNextStep status={app.status} />
    </li>
  );
}

function EligibilityAvailableRow({
  item,
  onApply,
  applying,
}: {
  readonly item: LearnerCertEligibilityItem;
  readonly onApply: (courseId: string) => void;
  readonly applying: boolean;
}): JSX.Element {
  return (
    <li
      className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5 ring-1 ring-white/[0.04]"
      data-testid={`learner-eligibility-available-${item.programmeId}`}
    >
      <p className="text-base font-semibold text-text-primary">{item.schemeTitle}</p>
      <p className="text-sm text-text-secondary">{item.programmeTitle}</p>
      <p className="mt-2 text-xs text-emerald-200/90">{item.learnerLabel}</p>
      <p className="mt-1 text-xs text-text-muted">{item.nextStep}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.canApply ? (
          <Button
            type="button"
            size="sm"
            className="bg-brand text-white hover:bg-brand/90"
            disabled={applying}
            data-testid={`learner-start-application-${item.programmeId}`}
            onClick={() => onApply(item.programmeId)}
          >
            {applying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Pokreni prijavu
          </Button>
        ) : (
          <p className="text-xs text-text-muted">{CERT_APPLY_FORM_PENDING_COPY}</p>
        )}
        {item.publicProgrammeUrl ? (
          <Button type="button" variant="outline" size="sm" className="border-border/60" asChild>
            <Link to={item.publicProgrammeUrl}>Javni pregled programa</Link>
          </Button>
        ) : null}
      </div>
    </li>
  );
}

function EligibilityBlockedRow({ item }: { readonly item: LearnerCertEligibilityItem }): JSX.Element {
  return (
    <li
      className="rounded-2xl border border-border/50 bg-surface-secondary/35 p-5"
      data-testid={`learner-eligibility-blocked-${item.programmeId}`}
    >
      <p className="text-base font-semibold text-text-primary">{item.schemeTitle}</p>
      <p className="text-sm text-text-secondary">{item.programmeTitle}</p>
      <p className="mt-2 text-xs font-medium text-amber-200/90">{item.learnerLabel}</p>
      {item.reason ? <p className="mt-1 text-xs text-text-muted">{item.reason}</p> : null}
      <p className="mt-2 text-sm text-text-secondary">{item.nextStep}</p>
      {item.publicProgrammeUrl ? (
        <Link to={item.publicProgrammeUrl} className="mt-3 inline-block text-xs font-medium text-brand underline-offset-2 hover:underline">
          Pregled programa
        </Link>
      ) : null}
    </li>
  );
}

export default function CertificationApplicationsPage(): JSX.Element {
  const queryClient = useQueryClient();
  const [applyCourseId, setApplyCourseId] = useState<string | null>(null);

  const eligibilityQ = useQuery({
    queryKey: ELIGIBILITY_KEY,
    queryFn: fetchMyCertificationEligibility,
  });

  const applicationsQ = useQuery({
    queryKey: APPLICATIONS_KEY,
    queryFn: fetchMyCertificationApplications,
  });

  const draftMutation = useMutation({
    mutationFn: (courseId: string) =>
      postCertificationDraft({
        courseId,
        workExperience: "—",
        overviewAcknowledged: true,
      }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: APPLICATIONS_KEY });
      await queryClient.invalidateQueries({ queryKey: ELIGIBILITY_KEY });
      window.location.assign(
        `/dashboard/certification/applications/${encodeURIComponent(data.applicationId)}/wizard`,
      );
    },
    onSettled: () => setApplyCourseId(null),
  });

  const sections = useMemo(() => {
    const items = eligibilityQ.data ?? [];
    const split = splitEligibilityItems(items);
    const apps = applicationsQ.data ?? [];
    const inProgressAppIds = new Set(
      apps
        .filter((a) => !isTerminalCertificationApplicationStatus(String(a.status)))
        .map((a) => a.applicationId),
    );
    const inProgressApps = apps.filter((a) => inProgressAppIds.has(a.applicationId));
    const eligibleCourseIds = new Set(split.available.map((i) => i.programmeId));
    const filteredAvailable = split.available.filter(
      (i) => !inProgressApps.some((a) => a.courseId === i.programmeId),
    );
    return {
      available: filteredAvailable,
      inProgressApps,
      blocked: split.blocked,
      hasEligibility: items.length > 0,
      eligibleCourseIds,
    };
  }, [eligibilityQ.data, applicationsQ.data]);

  const isLoading = eligibilityQ.isLoading || applicationsQ.isLoading;
  const isError = eligibilityQ.isError && applicationsQ.isError;
  const isFetching = eligibilityQ.isFetching || applicationsQ.isFetching;

  const handleApply = (courseId: string): void => {
    setApplyCourseId(courseId);
    draftMutation.mutate(courseId);
  };

  const showEmpty =
    !isLoading &&
    !isError &&
    sections.available.length === 0 &&
    sections.inProgressApps.length === 0 &&
    sections.blocked.length === 0;

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8" data-testid="learner-cert-applications-page">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
              <ClipboardList className="h-6 w-6 text-brand" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Prijave za certifikaciju</h1>
              <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                Pregled dostupnih shema, prijava u toku i preduvjeta za certifikaciju osobe.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-border/60"
            onClick={() => {
              void eligibilityQ.refetch();
              void applicationsQ.refetch();
            }}
            disabled={isFetching}
          >
            {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Osvježi
          </Button>
        </header>

        <CertificationLexiconBanner />

        <aside
          role="note"
          className="rounded-xl border border-sky-500/25 bg-sky-500/10 px-4 py-3 text-sm text-text-secondary"
          data-testid="learner-cert-application-notice"
        >
          {LEARNER_CERT_APPLICATION_NOTICE}
        </aside>

        <aside
          role="note"
          className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-text-secondary"
          data-testid="learner-cert-eligibility-boundary"
        >
          {CERT_ELIGIBILITY_BOUNDARY_NOTICE}
        </aside>

        <LearnerSupportEntryCard context="certification" />
        <ContextRibbon title="IA kontinuitet — prijava ↔ povjerenje i tragovi" items={IA_RIBBON_LEARNER_TRUST} />

        {isLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center gap-2 text-text-secondary">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            Učitavanje…
          </div>
        ) : null}

        {isError ? (
          <div className={cn("rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200")}>
            Prijave nisu učitane. Provjerite prijavu i API.
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <div className="space-y-10">
            <section aria-labelledby="cert-eligible-heading" data-testid="learner-cert-section-available">
              <h2 id="cert-eligible-heading" className="mb-4 text-lg font-semibold text-text-primary">
                A. Dostupno za prijavu
              </h2>
              {sections.available.length === 0 ? (
                <p className="text-sm text-text-muted">Trenutno nema shema spremnih za novu prijavu.</p>
              ) : (
                <ul className="space-y-4">
                  {sections.available.map((item) => (
                    <EligibilityAvailableRow
                      key={item.programmeId}
                      item={item}
                      applying={applyCourseId === item.programmeId && draftMutation.isPending}
                      onApply={handleApply}
                    />
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="cert-inprogress-heading" data-testid="learner-cert-section-in-progress">
              <h2 id="cert-inprogress-heading" className="mb-4 text-lg font-semibold text-text-primary">
                B. U toku
              </h2>
              {sections.inProgressApps.length === 0 ? (
                <p className="text-sm text-text-muted">Nemate aktivnih prijava u toku.</p>
              ) : (
                <ul className="space-y-4">
                  {sections.inProgressApps.map((app) => (
                    <ApplicationRow key={app.applicationId} app={app} />
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="cert-blocked-heading" data-testid="learner-cert-section-blocked">
              <h2 id="cert-blocked-heading" className="mb-4 text-lg font-semibold text-text-primary">
                C. Još nisu ispunjeni uslovi
              </h2>
              {sections.blocked.length === 0 ? (
                <p className="text-sm text-text-muted">Nema blokiranih programa za prikaz.</p>
              ) : (
                <ul className="space-y-4">
                  {sections.blocked.map((item) => (
                    <EligibilityBlockedRow key={item.programmeId} item={item} />
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}

        {showEmpty ? (
          <div
            className="rounded-2xl border border-border/50 bg-surface-secondary/40 px-6 py-12 text-center"
            data-testid="learner-no-cert-applications"
          >
            <p className="text-text-secondary">
              Trenutno nemate program koji ispunjava uslove za prijavu za certifikaciju.
            </p>
            <Button type="button" className="mt-6 bg-brand text-white hover:bg-brand/90" asChild>
              <Link to="/courses">Pregledaj katalog</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
