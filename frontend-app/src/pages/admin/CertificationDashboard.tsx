/**

 * Odbor — Kanban pregled prijava za certifikaciju (ISO 17024).

 */



import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import axios from "axios";

import { AlertCircle, ClipboardCheck, Loader2 } from "lucide-react";

import { useCallback, useMemo, useState, type JSX } from "react";

import { useOutletContext } from "react-router";

import { StaffApplicationAssignmentPanel } from "@/components/certification/StaffApplicationAssignmentPanel";
import { StaffApplicationBeginReviewPanel } from "@/components/certification/StaffApplicationBeginReviewPanel";

import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";

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

  type CertificationApplicationItem,

  type CommitteeDecision,

  fetchStaffCertificationApplicationDetail,

  fetchStaffCertificationApplications,

  submitDecision,

} from "@/lib/api-governance";

import { fetchApplicationAssignment } from "@/lib/api-staff-cert-assignment";
import { fetchApplicationReviewStatus } from "@/lib/api-staff-cert-begin-review";

import { resolveActorNestRoles, canReadAssignmentPanel, canShowAssignmentCreatorActions, canPerformReviewerAcceptDecline } from "@/lib/certification-assignment-access";
import { shouldLoadReviewStatusQuery } from "@/lib/certification-begin-review-access";

import { extractRealmRolesFromToken } from "@/lib/jwt-payload";

import type { DashboardOutletContext } from "@/pages/dashboard/dashboard-outlet-context";

import { useAuthStore } from "@/stores/authStore";

import { cn } from "@/lib/utils";



const CERT_APPLICATIONS_KEY = ["certification", "applications", "staff"] as const;



type GroupedBucket = "PENDING_REVIEW" | "APPROVED" | "REJECTED";



const COLUMNS: { status: GroupedBucket; title: string; description: string }[] = [

  { status: "PENDING_REVIEW", title: "Na čekanju", description: "PENDING_REVIEW" },

  { status: "APPROVED", title: "Odobreno", description: "APPROVED" },

  { status: "REJECTED", title: "Odbijeno", description: "REJECTED" },

];



function resolveCandidateLabel(app: CertificationApplicationItem): string {

  const reference = app.candidateReference?.trim();

  if (reference) return reference;

  const legacyUserId = app.userId?.trim();

  if (legacyUserId) return legacyUserId;

  return "—";

}



function ApplicationCard({

  app,

  onOpen,

}: {

  readonly app: CertificationApplicationItem;

  readonly onOpen: (a: CertificationApplicationItem) => void;

}): JSX.Element {

  return (

    <button

      type="button"

      onClick={() => {

        onOpen(app);

      }}

      className={cn(

        "w-full rounded-xl border border-border/50 bg-surface-secondary/90 p-4 text-left shadow-sm transition-all",

        "hover:border-brand/40 hover:bg-surface-secondary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",

      )}

    >

      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Prijava</p>

      <p className="mt-1 truncate font-semibold text-text-primary">{app.applicationId.slice(0, 8)}…</p>

      {app.schemeTitle ? (

        <p className="mt-2 truncate text-sm text-text-secondary">{app.schemeTitle}</p>

      ) : null}

      <p className="mt-2 truncate text-sm text-text-secondary">

        Kurs: {app.courseId || "—"}

      </p>

      <p className="mt-1 truncate text-xs text-text-muted">

        Kandidat: {resolveCandidateLabel(app)}

      </p>

      <p className="mt-1 truncate text-xs text-text-muted">Status: {app.status}</p>

    </button>

  );

}



export default function CertificationDashboard(): JSX.Element {

  const queryClient = useQueryClient();

  const { user } = useOutletContext<DashboardOutletContext>();

  const accessToken = useAuthStore((s) => s.accessToken);

  const currentUserId = useAuthStore((s) => s.user?.userId ?? s.user?.id ?? null);

  const nestRoles = useMemo(
    () =>
      resolveActorNestRoles({
        jwtRoles: extractRealmRolesFromToken(accessToken),
        roleFromProfile: user.role,
      }),
    [accessToken, user.role],
  );

  const shouldLoadAssignment = useMemo(
    () =>
      canReadAssignmentPanel(nestRoles) ||
      canShowAssignmentCreatorActions(nestRoles) ||
      canPerformReviewerAcceptDecline(nestRoles),
    [nestRoles],
  );

  const shouldLoadReview = useMemo(
    () => shouldLoadReviewStatusQuery(nestRoles),
    [nestRoles],
  );

  const [selectedListItem, setSelectedListItem] = useState<CertificationApplicationItem | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [decision, setDecision] = useState<CommitteeDecision>("APPROVED");

  const [coiCheck, setCoiCheck] = useState(false);

  const [comment, setComment] = useState("");

  const [formError, setFormError] = useState<string | null>(null);



  const { data: applications = [], isLoading, isError, refetch, isFetching } = useQuery({

    queryKey: CERT_APPLICATIONS_KEY,

    queryFn: () => fetchStaffCertificationApplications(),

  });



  const selectedApplicationId = selectedListItem?.applicationId ?? null;



  const {

    data: selectedDetail,

    isLoading: isDetailLoading,

    isError: isDetailError,

  } = useQuery({

    queryKey: [...CERT_APPLICATIONS_KEY, "detail", selectedApplicationId] as const,

    queryFn: () => fetchStaffCertificationApplicationDetail(selectedApplicationId!),

    enabled: dialogOpen && Boolean(selectedApplicationId),

  });



  const {

    data: assignmentData,

    isLoading: isAssignmentLoading,

    isError: isAssignmentError,

  } = useQuery({

    queryKey: [...CERT_APPLICATIONS_KEY, "assignment", selectedApplicationId] as const,

    queryFn: () => fetchApplicationAssignment(selectedApplicationId!),

    enabled: dialogOpen && Boolean(selectedApplicationId) && shouldLoadAssignment,

  });



  const {

    data: reviewStatusData,

    isLoading: isReviewLoading,

    isError: isReviewError,

  } = useQuery({

    queryKey: [...CERT_APPLICATIONS_KEY, "review", selectedApplicationId] as const,

    queryFn: () => fetchApplicationReviewStatus(selectedApplicationId!),

    enabled: dialogOpen && Boolean(selectedApplicationId) && shouldLoadReview,

  });



  const selected = selectedDetail ?? selectedListItem;



  const grouped = useMemo((): Record<GroupedBucket, CertificationApplicationItem[]> => {

    const pending: CertificationApplicationItem[] = [];

    const approved: CertificationApplicationItem[] = [];

    const rejected: CertificationApplicationItem[] = [];

    for (const app of applications) {

      const s = app.status;

      if (s === "APPROVED" || s === "ELIGIBLE_FOR_DECISION") {

        approved.push(app);

      } else if (s === "REJECTED" || s === "REJECTED_AFTER_DECISION" || s === "INELIGIBLE") {

        rejected.push(app);

      } else {

        pending.push(app);

      }

    }

    return { PENDING_REVIEW: pending, APPROVED: approved, REJECTED: rejected };

  }, [applications]);



  const openDialog = useCallback((app: CertificationApplicationItem) => {

    setSelectedListItem(app);

    setDecision("APPROVED");

    setCoiCheck(false);

    setComment("");

    setFormError(null);

    setDialogOpen(true);

  }, []);



  const decideMutation = useMutation({

    mutationFn: async () => {

      if (!selected) {

        throw new Error("Nema odabrane prijave.");

      }

      if (!comment.trim()) {

        throw new Error("Komentar je obavezan.");

      }

      if (!coiCheck) {

        throw new Error("Potvrdite provjeru sukoba interesa (COI).");

      }

      return submitDecision(selected.applicationId, {

        coiCheck: true,

        decision,

        comment: comment.trim(),

      });

    },

    onSuccess: async () => {

      setDialogOpen(false);

      setSelectedListItem(null);

      await queryClient.invalidateQueries({ queryKey: CERT_APPLICATIONS_KEY });

    },

    onError: (e: unknown) => {

      if (axios.isAxiosError(e)) {

        const d = e.response?.data as { detail?: unknown } | undefined;

        const detail = d?.detail;

        setFormError(

          typeof detail === "string"

            ? detail

            : Array.isArray(detail)

              ? detail.map((x) => String(x)).join(", ")

              : e.message,

        );

        return;

      }

      setFormError(e instanceof Error ? e.message : "Greška pri slanju odluke.");

    },

  });



  const handleSubmitDecision = useCallback(() => {

    setFormError(null);

    if (!coiCheck) {

      setFormError("Označite COI provjeru prije slanja.");

      return;

    }

    if (!comment.trim()) {

      setFormError("Unesite komentar odluke.");

      return;

    }

    decideMutation.mutate();

  }, [coiCheck, comment, decideMutation]);



  const isEmptyQueue = !isLoading && !isError && applications.length === 0;



  return (

    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">

      <div className="mx-auto max-w-7xl">

        <header className="mb-8 flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">

              <ClipboardCheck className="h-6 w-6 text-brand" aria-hidden />

            </div>

            <div>

              <h1 className="text-2xl font-bold tracking-tight text-text-primary">

                Odluke o certifikaciji

              </h1>

              <p className="mt-1 max-w-2xl text-sm text-text-secondary">

                Pregled prijava po statusu. Otvorite karticu za radno iskustvo i donošenje odluke (ISO 17024).

              </p>

            </div>

          </div>

          <Button

            type="button"

            variant="outline"

            className="shrink-0 border-border/60 bg-surface-secondary/80 text-text-primary hover:bg-surface-tertiary"

            onClick={() => {

              void refetch();

            }}

            disabled={isFetching}

          >

            {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}

            Osvježi

          </Button>

        </header>



        {isLoading ? (

          <div className="flex min-h-[40vh] items-center justify-center gap-2 text-text-secondary">

            <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden />

            <span>Učitavanje prijava…</span>

          </div>

        ) : isError ? (

          <div

            className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-200"

            role="alert"

          >

            <AlertCircle className="h-8 w-8" aria-hidden />

            <p>Ne mogu učitati prijave. Provjeri ulogu (admin/komitent) i da API radi.</p>

            <Button type="button" variant="outline" onClick={() => void refetch()}>

              Pokušaj ponovo

            </Button>

          </div>

        ) : isEmptyQueue ? (

          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 rounded-xl border border-border/50 bg-surface-secondary/40 p-8 text-center">

            <p className="text-base font-medium text-text-primary">Red prijava je prazan</p>

            <p className="max-w-md text-sm text-text-secondary">

              Nema poslanih prijava za pregled u ovom tenantu. Nove prijave pojavljuju se nakon što kandidat pošalje

              prijavu.

            </p>

          </div>

        ) : (

          <div className="grid gap-6 lg:grid-cols-3">

            {COLUMNS.map((col) => (

              <section

                key={col.status}

                className="flex min-h-[320px] flex-col rounded-2xl border border-border/50 bg-surface-secondary/40 p-4 ring-1 ring-white/[0.04]"

              >

                <div className="mb-4 border-b border-border/40 pb-3">

                  <h2 className="text-sm font-semibold uppercase tracking-wider text-text-primary">

                    {col.title}

                  </h2>

                  <p className="text-xs text-text-muted">{grouped[col.status].length} prijava</p>

                </div>

                <div className="flex flex-1 flex-col gap-3 overflow-y-auto">

                  {grouped[col.status].length === 0 ? (

                    <p className="py-8 text-center text-sm text-text-muted">Nema stavki.</p>

                  ) : (

                    grouped[col.status].map((app) => (

                      <ApplicationCard key={app.applicationId} app={app} onOpen={openDialog} />

                    ))

                  )}

                </div>

              </section>

            ))}

          </div>

        )}

      </div>



      <Dialog

        open={dialogOpen}

        onOpenChange={(open) => {

          setDialogOpen(open);

          if (!open) {

            setSelectedListItem(null);

          }

        }}

      >

        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-border/60 bg-surface-secondary text-text-primary sm:rounded-xl">

          <DialogHeader>

            <DialogTitle className="text-text-primary">Prijava za certifikaciju</DialogTitle>

            <DialogDescription className="text-text-secondary">

              ID: {selected?.applicationId} · Kurs: {selected?.courseId || "—"} · Kandidat:{" "}

              {selected ? resolveCandidateLabel(selected) : "—"}

            </DialogDescription>

          </DialogHeader>



          {isDetailLoading ? (

            <div className="flex items-center gap-2 py-6 text-sm text-text-secondary">

              <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />

              Učitavanje detalja prijave…

            </div>

          ) : isDetailError ? (

            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert">

              Detalj prijave nije dostupan. Zatvorite dijalog i pokušajte ponovo.

            </div>

          ) : selected ? (

            <div className="space-y-4">

              {selected.schemeTitle ? (

                <div>

                  <Label className="text-text-secondary">Shema</Label>

                  <p className="mt-1 text-sm text-text-primary">{selected.schemeTitle}</p>

                </div>

              ) : null}

              {selected.desiredScopeText ? (

                <div>

                  <Label className="text-text-secondary">Željeni opseg</Label>

                  <p className="mt-1 text-sm text-text-primary">{selected.desiredScopeText}</p>

                </div>

              ) : null}

              <div>

                <Label className="text-text-secondary">Radno iskustvo</Label>

                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border/50 bg-surface-primary/80 p-3 text-sm leading-relaxed text-text-primary">

                  {selected.workExperience || "—"}

                </div>

              </div>

              {selected.educationSummary ? (

                <div>

                  <Label className="text-text-secondary">Obrazovanje / dokazi</Label>

                  <p className="mt-1 text-sm text-text-primary">{selected.educationSummary}</p>

                </div>

              ) : null}

              {selected.accommodationRequested ? (

                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">

                  Prilagođavanje ispitivanja zatraženo (indikator — detalji nisu prikazani).

                </div>

              ) : null}

              {selected.additionalNotes ? (

                <div>

                  <Label className="text-text-secondary">Napomene</Label>

                  <p className="mt-1 text-sm text-text-primary">{selected.additionalNotes}</p>

                </div>

              ) : null}



              {selectedApplicationId ? (

                <StaffApplicationAssignmentPanel

                  applicationId={selectedApplicationId}

                  assignment={assignmentData}

                  isLoading={isAssignmentLoading}

                  isError={isAssignmentError}

                  nestRoles={nestRoles}

                  currentUserId={currentUserId}

                />

              ) : null}



              {selectedApplicationId ? (

                <StaffApplicationBeginReviewPanel

                  applicationId={selectedApplicationId}

                  applicationStatus={selected?.status ?? "UNKNOWN"}

                  reviewStatus={reviewStatusData}

                  assignment={assignmentData}

                  isLoading={isReviewLoading}

                  isError={isReviewError}

                  nestRoles={nestRoles}

                  currentUserId={currentUserId}

                />

              ) : null}



              {selected.status === "PENDING_REVIEW" ? (

                <>

                  <div className="space-y-2">

                    <Label htmlFor="decision" className="text-text-secondary">

                      Odluka

                    </Label>

                    <select

                      id="decision"

                      value={decision}

                      onChange={(e) => {

                        setDecision(e.target.value as CommitteeDecision);

                      }}

                      className="flex h-10 w-full rounded-md border border-border/60 bg-surface-primary px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"

                    >

                      <option value="APPROVED">Odobri (APPROVED)</option>

                      <option value="REJECTED">Odbij (REJECTED)</option>

                    </select>

                  </div>

                  <div className="flex items-center gap-2">

                    <Checkbox

                      id="coi"

                      checked={coiCheck}

                      onCheckedChange={(v) => {

                        setCoiCheck(v === true);

                      }}

                    />

                    <Label htmlFor="coi" className="cursor-pointer text-sm font-normal text-text-primary">

                      Potvrđujem provedenu provjeru sukoba interesa (COI)

                    </Label>

                  </div>

                  <div className="space-y-2">

                    <Label htmlFor="comment" className="text-text-secondary">

                      Komentar odluke

                    </Label>

                    <textarea

                      id="comment"

                      value={comment}

                      onChange={(e) => {

                        setComment(e.target.value);

                      }}

                      rows={4}

                      className="w-full resize-y rounded-md border border-border/60 bg-surface-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"

                      placeholder="Obrazloženje za odbor / audit trag…"

                    />

                  </div>

                  {formError ? <p className="text-sm text-red-400">{formError}</p> : null}

                </>

              ) : (

                <p className="text-sm text-text-muted">

                  Ova prijava je već obrađena ({selected.status}). Povijesni podaci iznad su read-only.

                </p>

              )}

            </div>

          ) : null}



          <DialogFooter className="gap-2 sm:gap-0">

            <Button

              type="button"

              variant="ghost"

              className="text-text-secondary hover:text-text-primary"

              onClick={() => {

                setDialogOpen(false);

              }}

            >

              Zatvori

            </Button>

            {selected?.status === "PENDING_REVIEW" ? (

              <Button

                type="button"

                className="bg-brand text-white hover:bg-brand/90"

                disabled={decideMutation.isPending || isDetailLoading}

                onClick={handleSubmitDecision}

              >

                {decideMutation.isPending ? (

                  <>

                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                    Šaljem…

                  </>

                ) : (

                  "Pošalji odluku"

                )}

              </Button>

            ) : null}

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>

  );

}


