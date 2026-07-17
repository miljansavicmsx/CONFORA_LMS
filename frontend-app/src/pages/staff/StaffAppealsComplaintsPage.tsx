/**
 * APPEALS-COMPLAINTS-2 — Staff resolution UX for appeals & complaints.
 * žalba ≠ prigovor; contact remains on /dashboard/admin/support and learner support.
 * Does not mutate certification status, exam results, or certificate lifecycle.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileWarning, Gavel, Loader2 } from "lucide-react";
import { useCallback, useState, type JSX } from "react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  acknowledgeAppeal,
  acknowledgeComplaint,
  fetchAdminAppealDetail,
  fetchAdminAppeals,
  fetchAdminComplaintDetail,
  fetchAdminComplaints,
  voidAppeal,
  voidComplaint,
  type AppealDetail,
  type AppealListItem,
  type ComplaintDetail,
  type ComplaintListItem,
} from "@/lib/api-grievances";
import { isAppealsCanonicalEnabled } from "@/lib/api/appeals-canonical-flag";
import { isComplaintsCanonicalEnabled } from "@/lib/api/complaints-canonical-flag";
import {
  STAFF_APPEAL_COMPLAINT_BOUNDARY_NOTICE,
  STAFF_RESOLUTION_DEFERRED_NOTICE,
  staffAppealStatusLabel,
  staffAppealTypeLabel,
  staffComplaintCategoryLabel,
  staffComplaintStatusLabel,
} from "@/lib/appeals-complaints-labels";
import { formatApiErrorMessage } from "@/lib/format-api-error";
import { cn } from "@/lib/utils";

type TabId = "appeals" | "complaints";

export type StaffAppealsComplaintsPageProps = {
  readonly initialTab?: TabId;
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("bs-BA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function truncateId(id: string): string {
  const t = id.trim();
  if (t.length <= 12) return t;
  return `${t.slice(0, 8)}…${t.slice(-4)}`;
}

const CANONICAL_APPEALS = isAppealsCanonicalEnabled();
const CANONICAL_COMPLAINTS = isComplaintsCanonicalEnabled();

export default function StaffAppealsComplaintsPage({
  initialTab = "appeals",
}: StaffAppealsComplaintsPageProps = {}): JSX.Element {
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabId>(initialTab);

  const appealsQ = useQuery({ queryKey: ["staffAppealsQueue"] as const, queryFn: fetchAdminAppeals });
  const complaintsQ = useQuery({
    queryKey: ["staffComplaintsQueue"] as const,
    queryFn: fetchAdminComplaints,
  });

  const [appealOpen, setAppealOpen] = useState(false);
  const [appealSel, setAppealSel] = useState<AppealListItem | null>(null);
  const [appealDetail, setAppealDetail] = useState<AppealDetail | null>(null);
  const [appealLoading, setAppealLoading] = useState(false);
  const [appealVoidReason, setAppealVoidReason] = useState("");
  const [appealErr, setAppealErr] = useState<string | null>(null);
  const [appealBusy, setAppealBusy] = useState(false);

  const [complaintOpen, setComplaintOpen] = useState(false);
  const [complaintSel, setComplaintSel] = useState<ComplaintListItem | null>(null);
  const [complaintDetail, setComplaintDetail] = useState<ComplaintDetail | null>(null);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintVoidReason, setComplaintVoidReason] = useState("");
  const [complaintErr, setComplaintErr] = useState<string | null>(null);
  const [complaintBusy, setComplaintBusy] = useState(false);

  const openAppeal = useCallback(async (row: AppealListItem) => {
    setAppealSel(row);
    setAppealOpen(true);
    setAppealErr(null);
    setAppealVoidReason("");
    setAppealLoading(true);
    try {
      setAppealDetail(await fetchAdminAppealDetail(row.appealId));
    } catch {
      setAppealDetail(null);
    } finally {
      setAppealLoading(false);
    }
  }, []);

  const openComplaint = useCallback(async (row: ComplaintListItem) => {
    setComplaintSel(row);
    setComplaintOpen(true);
    setComplaintErr(null);
    setComplaintVoidReason("");
    setComplaintLoading(true);
    try {
      setComplaintDetail(await fetchAdminComplaintDetail(row.complaintId));
    } catch {
      setComplaintDetail(null);
    } finally {
      setComplaintLoading(false);
    }
  }, []);

  const doAcknowledgeAppeal = async () => {
    if (!appealSel || !CANONICAL_APPEALS) return;
    setAppealBusy(true);
    setAppealErr(null);
    try {
      const d = await acknowledgeAppeal(appealSel.appealId);
      setAppealDetail(d);
      await qc.invalidateQueries({ queryKey: ["staffAppealsQueue"] });
    } catch (err) {
      setAppealErr(formatApiErrorMessage(err));
    } finally {
      setAppealBusy(false);
    }
  };

  const doVoidAppeal = async () => {
    if (!appealSel || !CANONICAL_APPEALS || !appealVoidReason.trim()) return;
    setAppealBusy(true);
    setAppealErr(null);
    try {
      const d = await voidAppeal(appealSel.appealId, appealVoidReason.trim());
      setAppealDetail(d);
      setAppealVoidReason("");
      await qc.invalidateQueries({ queryKey: ["staffAppealsQueue"] });
    } catch (err) {
      setAppealErr(formatApiErrorMessage(err));
    } finally {
      setAppealBusy(false);
    }
  };

  const doAcknowledgeComplaint = async () => {
    if (!complaintSel || !CANONICAL_COMPLAINTS) return;
    setComplaintBusy(true);
    setComplaintErr(null);
    try {
      const d = await acknowledgeComplaint(complaintSel.complaintId);
      setComplaintDetail(d);
      await qc.invalidateQueries({ queryKey: ["staffComplaintsQueue"] });
    } catch (err) {
      setComplaintErr(formatApiErrorMessage(err));
    } finally {
      setComplaintBusy(false);
    }
  };

  const doVoidComplaint = async () => {
    if (!complaintSel || !CANONICAL_COMPLAINTS || !complaintVoidReason.trim()) return;
    setComplaintBusy(true);
    setComplaintErr(null);
    try {
      const d = await voidComplaint(complaintSel.complaintId, complaintVoidReason.trim());
      setComplaintDetail(d);
      setComplaintVoidReason("");
      await qc.invalidateQueries({ queryKey: ["staffComplaintsQueue"] });
    } catch (err) {
      setComplaintErr(formatApiErrorMessage(err));
    } finally {
      setComplaintBusy(false);
    }
  };

  const view = appealDetail ?? appealSel;
  const cView = complaintDetail ?? complaintSel;

  return (
    <div
      className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8"
      data-testid="staff-appeals-complaints-page"
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-border/40 pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Žalbe i prigovori — osoblje</h1>
          <p
            className="mt-2 max-w-3xl text-sm text-text-secondary"
            data-testid="staff-appeals-complaints-boundary"
          >
            {STAFF_APPEAL_COMPLAINT_BOUNDARY_NOTICE}
          </p>
          <p className="mt-2 text-xs text-text-muted" data-testid="staff-resolution-deferred-notice">
            {STAFF_RESOLUTION_DEFERRED_NOTICE}
          </p>
          <p className="mt-2 text-xs text-text-muted">
            Kontakt / podrška ostaje odvojeno:{" "}
            <Link
              to="/dashboard/admin/support"
              className="font-medium text-brand underline-offset-2 hover:underline"
              data-testid="staff-to-support-link"
            >
              Registar podrške
            </Link>
            . Polaznički unos:{" "}
            <Link to="/dashboard/appeals-complaints" className="font-medium text-brand underline-offset-2 hover:underline">
              /dashboard/appeals-complaints
            </Link>
            .
          </p>
        </header>

        <div
          className="mb-6 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Žalbe i prigovori — osoblje"
          data-testid="staff-appeals-complaints-tabs"
        >
          <Button
            type="button"
            role="tab"
            aria-selected={tab === "appeals"}
            variant={tab === "appeals" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("appeals")}
            data-testid="staff-appeals-tab"
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
            data-testid="staff-complaints-tab"
          >
            Prigovori
          </Button>
        </div>

        {tab === "appeals" ? (
          <section data-testid="staff-appeals-section" aria-labelledby="staff-appeals-heading">
            <div className="mb-4 flex items-start gap-3">
              <Gavel className="mt-0.5 h-5 w-5 text-amber-200" aria-hidden />
              <div>
                <h2 id="staff-appeals-heading" className="text-lg font-semibold text-text-primary">
                  Red žalbi
                </h2>
                <p className="text-sm text-text-secondary">
                  API: {CANONICAL_APPEALS ? "/v1/staff/appeals" : "/v1/admin/appeals"} — zaprimanje/poništenje ne
                  mijenja status certifikacije.
                </p>
              </div>
            </div>
            {appealsQ.isLoading ? (
              <div className="flex items-center gap-2 text-text-secondary">
                <Loader2 className="h-5 w-5 animate-spin text-brand" />
                Učitavanje žalbi…
              </div>
            ) : null}
            {appealsQ.isError ? (
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                Nije moguće učitati žalbe. {formatApiErrorMessage(appealsQ.error)}
              </p>
            ) : null}
            {!appealsQ.isLoading && !appealsQ.isError && (appealsQ.data?.length ?? 0) === 0 ? (
              <p
                className="rounded-xl border border-dashed border-border/50 bg-surface-secondary/30 px-4 py-8 text-sm text-text-secondary"
                data-testid="staff-appeals-empty"
              >
                Nema žalbi u redu.
              </p>
            ) : null}
            <ul className="mt-4 flex flex-col gap-3">
              {appealsQ.data?.map((row) => (
                <li key={row.appealId}>
                  <button
                    type="button"
                    className="w-full rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-left text-sm transition hover:border-amber-400/50"
                    data-testid={`staff-appeal-card-${row.appealId}`}
                    onClick={() => void openAppeal(row)}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      <span className="font-mono">{truncateId(row.appealId)}</span>
                      <span aria-hidden>·</span>
                      <time dateTime={row.createdAt}>{formatDate(row.createdAt)}</time>
                    </div>
                    <p className="mt-2 font-medium text-text-primary">{row.summary || "Žalba"}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-amber-500/40 font-normal text-amber-100">
                        {staffAppealTypeLabel(String(row.appealType ?? "CERTIFICATION_DECISION_APPEAL"))}
                      </Badge>
                      <Badge variant="outline" className="border-border/50 font-normal text-text-secondary">
                        {staffAppealStatusLabel(String(row.status))}
                      </Badge>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {tab === "complaints" ? (
          <section data-testid="staff-complaints-section" aria-labelledby="staff-complaints-heading">
            <div className="mb-4 flex items-start gap-3">
              <FileWarning className="mt-0.5 h-5 w-5 text-brand" aria-hidden />
              <div>
                <h2 id="staff-complaints-heading" className="text-lg font-semibold text-text-primary">
                  Red prigovora
                </h2>
                <p className="text-sm text-text-secondary">
                  API: {CANONICAL_COMPLAINTS ? "/v1/staff/complaints" : "/v1/admin/complaints"} — odvojeno od žalbi i
                  kontakta.
                </p>
              </div>
            </div>
            {complaintsQ.isLoading ? (
              <div className="flex items-center gap-2 text-text-secondary">
                <Loader2 className="h-5 w-5 animate-spin text-brand" />
                Učitavanje prigovora…
              </div>
            ) : null}
            {complaintsQ.isError ? (
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                Nije moguće učitati prigovore. {formatApiErrorMessage(complaintsQ.error)}
              </p>
            ) : null}
            {!complaintsQ.isLoading && !complaintsQ.isError && (complaintsQ.data?.length ?? 0) === 0 ? (
              <p
                className="rounded-xl border border-dashed border-border/50 bg-surface-secondary/30 px-4 py-8 text-sm text-text-secondary"
                data-testid="staff-complaints-empty"
              >
                Nema prigovora u redu.
              </p>
            ) : null}
            <ul className="mt-4 flex flex-col gap-3">
              {complaintsQ.data?.map((row) => (
                <li key={row.complaintId}>
                  <button
                    type="button"
                    className={cn(
                      "w-full rounded-xl border border-border/50 bg-surface-secondary/40 p-4 text-left text-sm transition hover:border-brand/40",
                    )}
                    data-testid={`staff-complaint-card-${row.complaintId}`}
                    onClick={() => void openComplaint(row)}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      <span className="font-mono">{row.publicReference || truncateId(row.complaintId)}</span>
                      <span aria-hidden>·</span>
                      <time dateTime={row.createdAt}>{formatDate(row.createdAt)}</time>
                    </div>
                    <p className="mt-2 font-medium text-text-primary">{row.subject || "Prigovor"}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-orange-500/40 font-normal text-orange-100">
                        {staffComplaintCategoryLabel(String(row.category || row.complaintType || "complaint"))}
                      </Badge>
                      <Badge variant="outline" className="border-border/50 font-normal text-text-secondary">
                        {staffComplaintStatusLabel(String(row.status))}
                      </Badge>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <Dialog open={appealOpen} onOpenChange={setAppealOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto border-border/60 bg-surface-primary sm:max-w-lg"
          data-testid="staff-appeal-detail-dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-text-primary">Detalj žalbe</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Obrada žalbe ne izdaje certifikat i ne mijenja rezultat ispita.
            </DialogDescription>
          </DialogHeader>
          {appealLoading ? (
            <div className="flex items-center gap-2 text-text-secondary">
              <Loader2 className="h-5 w-5 animate-spin" /> Učitavanje…
            </div>
          ) : view ? (
            <div className="space-y-3 text-sm">
              <p className="font-mono text-xs text-text-muted">{view.appealId}</p>
              <p className="font-medium text-text-primary">{view.summary || "—"}</p>
              <p className="text-text-secondary whitespace-pre-wrap">{view.grounds || "—"}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{staffAppealTypeLabel(String(view.appealType ?? ""))}</Badge>
                <Badge variant="outline" data-testid="staff-appeal-detail-status">
                  {staffAppealStatusLabel(String(view.status))}
                </Badge>
              </div>
              {CANONICAL_APPEALS && String(view.status).toUpperCase() === "SUBMITTED" ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={appealBusy}
                  onClick={() => void doAcknowledgeAppeal()}
                  data-testid="staff-appeal-acknowledge"
                >
                  Zaprimi žalbu
                </Button>
              ) : null}
              {CANONICAL_APPEALS && !["VOIDED", "CLOSED"].includes(String(view.status).toUpperCase()) ? (
                <div className="space-y-2 rounded-lg border border-border/40 p-3">
                  <Label htmlFor="staff-appeal-void-reason">Razlog poništenja</Label>
                  <input
                    id="staff-appeal-void-reason"
                    value={appealVoidReason}
                    onChange={(e) => setAppealVoidReason(e.target.value)}
                    className="w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm"
                    data-testid="staff-appeal-void-reason"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={appealBusy || !appealVoidReason.trim()}
                    onClick={() => void doVoidAppeal()}
                    data-testid="staff-appeal-void"
                  >
                    Poništi žalbu
                  </Button>
                </div>
              ) : null}
              <p className="text-xs text-text-muted" data-testid="staff-appeal-pipeline-deferred">
                Dopustivost / dokazi / odluka / remedy — odgođeno (API postoji; UI u kasnijem slice-u).
              </p>
              {appealErr ? (
                <p className="text-sm text-red-200" role="alert">
                  {appealErr}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-text-secondary">Detalj nije dostupan.</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAppealOpen(false)}>
              Zatvori
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={complaintOpen} onOpenChange={setComplaintOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto border-border/60 bg-surface-primary sm:max-w-lg"
          data-testid="staff-complaint-detail-dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-text-primary">Detalj prigovora</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Rješavanje prigovora nije žalba i ne pokreće izdavanje certifikata.
            </DialogDescription>
          </DialogHeader>
          {complaintLoading ? (
            <div className="flex items-center gap-2 text-text-secondary">
              <Loader2 className="h-5 w-5 animate-spin" /> Učitavanje…
            </div>
          ) : cView ? (
            <div className="space-y-3 text-sm">
              <p className="font-mono text-xs text-text-muted">
                {cView.publicReference || cView.complaintId}
              </p>
              <p className="font-medium text-text-primary">{cView.subject || "—"}</p>
              <p className="text-text-secondary whitespace-pre-wrap">{cView.description || "—"}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {staffComplaintCategoryLabel(String(cView.category || cView.complaintType || ""))}
                </Badge>
                <Badge variant="outline" data-testid="staff-complaint-detail-status">
                  {staffComplaintStatusLabel(String(cView.status))}
                </Badge>
              </div>
              {CANONICAL_COMPLAINTS && String(cView.status).toUpperCase() === "SUBMITTED" ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={complaintBusy}
                  onClick={() => void doAcknowledgeComplaint()}
                  data-testid="staff-complaint-acknowledge"
                >
                  Zaprimi prigovor
                </Button>
              ) : null}
              {CANONICAL_COMPLAINTS && !["VOIDED", "CLOSED", "RESOLVED"].includes(String(cView.status).toUpperCase()) ? (
                <div className="space-y-2 rounded-lg border border-border/40 p-3">
                  <Label htmlFor="staff-complaint-void-reason">Razlog poništenja</Label>
                  <input
                    id="staff-complaint-void-reason"
                    value={complaintVoidReason}
                    onChange={(e) => setComplaintVoidReason(e.target.value)}
                    className="w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm"
                    data-testid="staff-complaint-void-reason"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={complaintBusy || !complaintVoidReason.trim()}
                    onClick={() => void doVoidComplaint()}
                    data-testid="staff-complaint-void"
                  >
                    Poništi prigovor
                  </Button>
                </div>
              ) : null}
              <p className="text-xs text-text-muted" data-testid="staff-complaint-pipeline-deferred">
                Trijaža / istraga / odluka / action — odgođeno (API postoji; UI u kasnijem slice-u).
              </p>
              {complaintErr ? (
                <p className="text-sm text-red-200" role="alert">
                  {complaintErr}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-text-secondary">Detalj nije dostupan.</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setComplaintOpen(false)}>
              Zatvori
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
