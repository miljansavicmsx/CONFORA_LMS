/**
 * APPEALS-COMPLAINTS-1 — Learner appeals & complaints foundation page.
 * žalba ≠ prigovor; contact request remains on /dashboard/support.
 */

import { useQuery } from "@tanstack/react-query";
import { FileWarning, Gavel, Loader2, Plus } from "lucide-react";
import { useCallback, useState, type JSX } from "react";
import { Link } from "react-router";

import { FormalAppealDialog } from "@/components/grievances/FormalAppealDialog";
import { FormalComplaintDialog } from "@/components/grievances/FormalComplaintDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchMyAppeals, fetchMyComplaints, type AppealListItem, type ComplaintListItem } from "@/lib/api-grievances";
import {
  APPEAL_COMPLAINT_BOUNDARY_NOTICE,
  APPEAL_SECTION_NOTICE,
  COMPLAINT_SECTION_NOTICE,
  CONTACT_BOUNDARY_NOTICE,
  learnerAppealStatusLabel,
  learnerAppealTypeLabel,
  learnerComplaintCategoryLabel,
  learnerComplaintStatusLabel,
} from "@/lib/appeals-complaints-labels";
import { cn } from "@/lib/utils";

const Q_COMPLAINTS = ["myComplaints"] as const;
const Q_APPEALS = ["myAppeals"] as const;

type TabId = "appeals" | "complaints";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("bs-BA", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function truncateId(id: string): string {
  const t = id.trim();
  if (t.length <= 12) return t;
  return `${t.slice(0, 8)}…${t.slice(-4)}`;
}

function AppealCard({ row }: { readonly row: AppealListItem }): JSX.Element {
  return (
    <article
      className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm"
      data-testid={`learner-appeal-card-${row.appealId}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <Gavel className="h-4 w-4 text-amber-200" aria-hidden />
        <span className="font-mono" title={row.appealId}>
          {truncateId(row.appealId)}
        </span>
        <span aria-hidden>·</span>
        <time dateTime={row.createdAt}>{formatDate(row.createdAt)}</time>
      </div>
      <p className="mt-2 font-medium text-text-primary">{row.summary}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant="outline" className="border-amber-500/40 font-normal text-amber-100">
          {learnerAppealTypeLabel(String(row.appealType ?? "CERTIFICATION_DECISION_APPEAL"))}
        </Badge>
        <Badge
          variant="outline"
          className="border-border/50 font-normal text-text-secondary"
          data-testid={`learner-appeal-status-${row.appealId}`}
        >
          {learnerAppealStatusLabel(String(row.status))}
        </Badge>
      </div>
    </article>
  );
}

function ComplaintCard({ row }: { readonly row: ComplaintListItem }): JSX.Element {
  return (
    <article
      className="rounded-xl border border-border/50 bg-surface-secondary/40 p-4 text-sm"
      data-testid={`learner-complaint-card-${row.complaintId}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <FileWarning className="h-4 w-4 text-brand" aria-hidden />
        <span className="font-mono" title={row.complaintId}>
          {truncateId(row.complaintId)}
        </span>
        <span aria-hidden>·</span>
        <time dateTime={row.createdAt}>{formatDate(row.createdAt)}</time>
      </div>
      <p className="mt-2 font-medium text-text-primary">{row.subject}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant="outline" className={cn("border font-normal", "border-orange-500/40 text-orange-100")}>
          {learnerComplaintCategoryLabel(row.category)}
        </Badge>
        <Badge
          variant="outline"
          className="border-border/50 font-normal text-text-secondary"
          data-testid={`learner-complaint-status-${row.complaintId}`}
        >
          {learnerComplaintStatusLabel(String(row.status))}
        </Badge>
      </div>
    </article>
  );
}

export default function AppealsComplaintsPage(): JSX.Element {
  const [tab, setTab] = useState<TabId>("appeals");
  const [appealOpen, setAppealOpen] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const appealsQ = useQuery({ queryKey: Q_APPEALS, queryFn: fetchMyAppeals });
  const complaintsQ = useQuery({ queryKey: Q_COMPLAINTS, queryFn: fetchMyComplaints });

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8" data-testid="learner-appeals-complaints-page">
      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-xl border border-emerald-500/40 bg-emerald-950/90 px-4 py-3 text-sm text-emerald-100 shadow-lg backdrop-blur"
          role="status"
          data-testid="learner-appeals-complaints-toast"
        >
          {toast}
        </div>
      ) : null}

      <div className="mx-auto max-w-4xl">
        <header className="mb-8 border-b border-border/40 pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Žalbe i prigovori</h1>
          <p className="mt-2 max-w-3xl text-sm text-text-secondary" data-testid="learner-appeals-complaints-boundary">
            {APPEAL_COMPLAINT_BOUNDARY_NOTICE}
          </p>
          <p className="mt-2 text-xs text-text-muted" data-testid="learner-appeals-contact-boundary">
            {CONTACT_BOUNDARY_NOTICE}{" "}
            <Link to="/dashboard/support" className="font-medium text-brand underline-offset-2 hover:underline">
              Idi na podršku / kontakt
            </Link>
          </p>
        </header>

        <div
          className="mb-6 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Žalbe i prigovori"
          data-testid="learner-appeals-complaints-tabs"
        >
          <Button
            type="button"
            role="tab"
            aria-selected={tab === "appeals"}
            variant={tab === "appeals" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("appeals")}
            data-testid="learner-appeals-tab"
          >
            Žalbe
          </Button>
          <Button
            type="button"
            role="tab"
            aria-selected={tab === "complaints"}
            variant={tab === "complaints" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("complaints")}
            data-testid="learner-complaints-tab"
          >
            Prigovori
          </Button>
        </div>

        {tab === "appeals" ? (
          <section aria-labelledby="appeals-heading" data-testid="learner-appeals-section">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 id="appeals-heading" className="text-lg font-semibold text-text-primary">
                  Žalbe
                </h2>
                <p className="mt-1 text-sm text-text-secondary">{APPEAL_SECTION_NOTICE}</p>
              </div>
              <Button type="button" size="sm" onClick={() => setAppealOpen(true)} data-testid="learner-appeal-new-btn">
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                Nova žalba
              </Button>
            </div>
            {appealsQ.isLoading ? (
              <div className="flex items-center gap-2 text-text-secondary">
                <Loader2 className="h-6 w-6 animate-spin text-brand" />
                Učitavanje žalbi…
              </div>
            ) : null}
            {appealsQ.isError ? (
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                Trenutno nije moguće učitati žalbe. Provjerite prijavu i pokušajte ponovo.
              </p>
            ) : null}
            {!appealsQ.isLoading && !appealsQ.isError && (appealsQ.data?.length ?? 0) === 0 ? (
              <p
                className="rounded-xl border border-dashed border-border/50 bg-surface-secondary/30 px-4 py-8 text-sm text-text-secondary"
                data-testid="learner-appeals-empty"
              >
                Još nemate podnesenih žalbi.
              </p>
            ) : null}
            <ul className="mt-4 flex flex-col gap-3">
              {appealsQ.data?.map((row) => (
                <li key={row.appealId}>
                  <AppealCard row={row} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {tab === "complaints" ? (
          <section aria-labelledby="complaints-heading" data-testid="learner-complaints-section">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 id="complaints-heading" className="text-lg font-semibold text-text-primary">
                  Prigovori
                </h2>
                <p className="mt-1 text-sm text-text-secondary">{COMPLAINT_SECTION_NOTICE}</p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => setComplaintOpen(true)}
                data-testid="learner-complaint-new-btn"
              >
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                Novi prigovor
              </Button>
            </div>
            {complaintsQ.isLoading ? (
              <div className="flex items-center gap-2 text-text-secondary">
                <Loader2 className="h-6 w-6 animate-spin text-brand" />
                Učitavanje prigovora…
              </div>
            ) : null}
            {complaintsQ.isError ? (
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                Trenutno nije moguće učitati prigovore. Provjerite prijavu i pokušajte ponovo.
              </p>
            ) : null}
            {!complaintsQ.isLoading && !complaintsQ.isError && (complaintsQ.data?.length ?? 0) === 0 ? (
              <p
                className="rounded-xl border border-dashed border-border/50 bg-surface-secondary/30 px-4 py-8 text-sm text-text-secondary"
                data-testid="learner-complaints-empty"
              >
                Još nemate podnesenih prigovora.
              </p>
            ) : null}
            <ul className="mt-4 flex flex-col gap-3">
              {complaintsQ.data?.map((row) => (
                <li key={row.complaintId}>
                  <ComplaintCard row={row} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <FormalAppealDialog
        open={appealOpen}
        onOpenChange={setAppealOpen}
        onSuccess={() => showToast("Žalba je zaprimljena. Status certifikacije nije automatski promijenjen.")}
      />
      <FormalComplaintDialog
        open={complaintOpen}
        onOpenChange={setComplaintOpen}
        onSuccess={() => {
          showToast("Prigovor je zaprimljen.");
          void complaintsQ.refetch();
        }}
      />
    </div>
  );
}
