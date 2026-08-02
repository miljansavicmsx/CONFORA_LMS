import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useMemo, useState, type JSX } from "react";
import { Link, useOutletContext, useParams } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { DashboardOutletContext } from "@/pages/dashboard/dashboard-outlet-context";
import {
  decisionStatusLabelHr,
  fetchCertificationDecision,
  fetchCertificationDecisionEvents,
  postCertificationDecisionApprove,
  postCertificationDecisionDeclareCoi,
  postCertificationDecisionReject,
  postCertificationDecisionReturnInfo,
  postCertificationDecisionStartReview,
  type CertificationDecisionEventRow,
} from "@/lib/api-certification-decisions";
import {
  getCommitteeReview,
  type CommitteeReviewDetail,
} from "@/lib/api-committee-review";
import { formatUserFacingError } from "@/lib/user-facing-error";
import {
  normalizePrimaryRoleForRbac,
  ROLE_CERT_COMMITTEE,
  ROLE_SYS_ADMIN,
} from "@/lib/roles";
const eventsKey = (id: string) => ["committee", "formal-decision", id, "events"] as const;
const committeeReviewKey = (applicationId: string) => ["committee", "committee-review", applicationId] as const;
const decisionKey = (id: string) => ["certification", "decision", id] as const;

export default function CommitteeFormalDecisionReviewPage(): JSX.Element {
  const params = useParams();
  const { user } = useOutletContext<DashboardOutletContext>();
  const qc = useQueryClient();
  const decisionId = useMemo(() => String(params.decisionId ?? "").trim(), [params.decisionId]);

  const roleNorm = normalizePrimaryRoleForRbac(user.role);
  const mayVote = roleNorm === ROLE_CERT_COMMITTEE;
  const sysAdminReadOnly = roleNorm === ROLE_SYS_ADMIN;
  const showCommitteeVoteUi = mayVote || sysAdminReadOnly;
  const voteActionsLocked = !mayVote;

  const [coiConflict, setCoiConflict] = useState(false);
  const [coiRecuse, setCoiRecuse] = useState(false);
  const [coiComment, setCoiComment] = useState("");
  const [a1, setA1] = useState(false);
  const [a2, setA2] = useState(false);
  const [a3, setA3] = useState(false);
  const [a4, setA4] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [returnComment, setReturnComment] = useState("");
  const [approveComment, setApproveComment] = useState("");
  const [approveLevel, setApproveLevel] = useState("");
  const [rejectRationale, setRejectRationale] = useState("");

  const dQ = useQuery({
    queryKey: decisionKey(decisionId),
    queryFn: () => fetchCertificationDecision(decisionId),
    enabled: decisionId.length > 0,
  });

  const eQ = useQuery({
    queryKey: eventsKey(decisionId),
    queryFn: () => fetchCertificationDecisionEvents(decisionId),
    enabled: decisionId.length > 0,
    retry: false,
  });

  const appIdForEvidence = String(dQ.data?.applicationId ?? "").trim();
  const rQ = useQuery({
    queryKey: committeeReviewKey(appIdForEvidence),
    queryFn: () => getCommitteeReview(appIdForEvidence),
    enabled: appIdForEvidence.length > 0,
    retry: false,
  });

  const invalidate = (): void => {
    void qc.invalidateQueries({ queryKey: decisionKey(decisionId) });
    void qc.invalidateQueries({ queryKey: eventsKey(decisionId) });
  };

  const coiMutation = useMutation({
    mutationFn: () =>
      postCertificationDecisionDeclareCoi(decisionId, {
        hasConflict: coiConflict,
        recuse: coiRecuse,
        ...(coiComment.trim() ? { comment: coiComment.trim() } : {}),
        ...(mayVote && !coiConflict
          ? {
              attestations: {
                noUndeclaredConflict: a1,
                notInvolvedInCandidateTraining: a2,
                notExamItemAuthorAffectingImpartiality: a3,
                noBusinessOrPersonalInterestRelationship: a4,
              },
            }
          : {}),
      }),
    onSuccess: () => invalidate(),
  });

  const startMutation = useMutation({
    mutationFn: () =>
      postCertificationDecisionStartReview(
        decisionId,
        reviewNote.trim() ? { note: reviewNote.trim() } : {},
      ),
    onSuccess: () => invalidate(),
  });

  const returnMutation = useMutation({
    mutationFn: () =>
      postCertificationDecisionReturnInfo(decisionId, {
        comment: returnComment.trim() || "",
      }),
    onSuccess: () => {
      invalidate();
      setReturnComment("");
    },
  });

  const approveMutation = useMutation({
    mutationFn: () =>
      postCertificationDecisionApprove(decisionId, {
        comment: approveComment.trim(),
        ...(approveLevel.trim() ? { approvedCertificationLevel: approveLevel.trim() } : {}),
      }),
    onSuccess: () => {
      invalidate();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      postCertificationDecisionReject(decisionId, {
        rationale: rejectRationale.trim(),
      }),
    onSuccess: () => {
      invalidate();
    },
  });

  if (!decisionId) {
    return <p className="p-6 text-sm text-red-400">Nedostaje decisionId.</p>;
  }

  if (dQ.isLoading || !dQ.data) {
    return (
      <div className="flex items-center gap-2 p-8 text-text-secondary">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Učitavanje formalne odluke…
      </div>
    );
  }

  if (dQ.isError) {
    return (
      <div className="p-8 text-sm text-red-400">
        Odluku nije moguće učitati (nema ovlasti ili nepoznat ID).
      </div>
    );
  }

  const row = dQ.data;

  function evidenceBlock(ev: CommitteeReviewDetail | undefined): JSX.Element | null {
    if (!ev) return null;
    const { documents, workExperienceRecords, referees } = ev.evidenceSummary;
    return (
      <section className="rounded-xl border border-border/50 p-4">
        <h2 className="font-semibold text-text-primary">Dokazi iz prijave</h2>
        <ul className="mt-3 list-inside list-disc text-sm text-text-secondary">
          <li>Dokumenti: {documents}</li>
          <li>Radno iskustvo: {workExperienceRecords}</li>
          <li>Referentne osobe: {referees}</li>
        </ul>
      </section>
    );
  }

  const eventsForbidden =
    axios.isAxiosError(eQ.error) && eQ.error.response?.status === 403;
  const events: CertificationDecisionEventRow[] = Array.isArray(eQ.data) ? eQ.data : [];

  const staffDecisionShape = typeof row.committeeId === "string" && row.committeeId.length > 0;

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/dashboard/committee/decisions"
            className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden /> Red odluka
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Formalna odluka certifikacije</h1>

        <section className="rounded-xl border border-border/50 p-4 ring-1 ring-white/[0.04]">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-brand/40 font-medium text-brand">
              {decisionStatusLabelHr(String(row.status))}
            </Badge>
            <span className="font-mono text-xs text-text-muted">{row.decisionId}</span>
            {row.appealEligible ? (
              <Badge variant="outline" className="text-amber-200/90">
                Žalba moguća
              </Badge>
            ) : null}
            {row.certificateId ? (
              <Badge variant="outline">
                CERT {row.certificateId.slice(0, 14)}
                {(row.certificateId?.length ?? 0) > 14 ? "…" : ""}
              </Badge>
            ) : null}
          </div>
          <p className="mt-3 text-sm text-text-secondary">
            Prijava <span className="font-mono text-text-primary">{row.applicationId}</span>
            {" · "}
            Kurs <span className="font-mono text-text-primary">{row.courseId}</span>
          </p>
          {typeof row.quorumRequired === "number" ? (
            <p className="mt-2 text-xs text-text-muted">
              Kvorum: {row.quorumMet ? "ostvaren" : "nedostaje"} · COI obrada:{" "}
              {row.coiComplete ? "kompletna" : "u tijeku"}
              {row.coiBlocked ? " · blokiran sukobom" : ""}
            </p>
          ) : null}
        </section>

        {rQ.data ? evidenceBlock(rQ.data) : null}

        {!rQ.data && !rQ.isLoading && staffDecisionShape ? (
          <p className="text-sm text-text-muted">Sažetak dokaza dostupan kad je dostupan izvještaj pregleda prijave.</p>
        ) : null}

        {staffDecisionShape ? (
          <section className="rounded-xl border border-border/50 p-4">
            <h2 className="font-semibold text-text-primary">Povijest događaja</h2>
            {eQ.isLoading ? (
              <p className="mt-3 text-sm text-text-muted">
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Učitavanje zapisa…
              </p>
            ) : null}
            {eventsForbidden ? (
              <p className="mt-3 text-sm text-text-muted">Detaljni zapis dostupan samo povlaštenim ulogama odbora.</p>
            ) : null}
            {!eQ.isLoading && !eventsForbidden && events.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm">
                {events
                  .slice()
                  .sort((x, y) => String(y.at).localeCompare(String(x.at)))
                  .map((ev) => (
                    <li key={ev.eventId} className="rounded-md border border-border/40 px-3 py-2 font-mono text-xs">
                      <span className="text-text-muted">{ev.at}</span>{" "}
                      <span className="text-brand">{ev.eventType}</span>
                    </li>
                  ))}
              </ul>
            ) : null}
            {!eQ.isLoading && !eventsForbidden && events.length === 0 ? (
              <p className="mt-3 text-sm text-text-muted">Još nema događaja.</p>
            ) : null}
          </section>
        ) : null}

        {showCommitteeVoteUi ? (
          <section className="rounded-xl border border-border/40 border-dashed p-4">
            {sysAdminReadOnly ? (
              <p className="mb-3 text-xs font-medium text-amber-200/90">
                Pregled kao sys_admin — tipke za odluku i COI namjerno su onemogućene; glasanje je samo za{" "}
                <span className="font-mono">cert_committee</span>.
              </p>
            ) : null}
            <h2 className="font-semibold text-text-primary">COI obajava člana komiteta</h2>
            <p className="mt-1 text-xs text-text-muted">
              Pri odgovoru bez sukoba obavezna su sve četiri potvrde (ISO nepristranost prije izjašnjavanja).
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Checkbox
                id="coi-conflict"
                checked={coiConflict}
                disabled={voteActionsLocked}
                onCheckedChange={(v) => setCoiConflict(v === true)}
              />
              <label htmlFor="coi-conflict" className="text-sm text-text-secondary">
                Postoji sukob interesa koji utječe na odluku
              </label>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Checkbox
                id="coi-recuse"
                checked={coiRecuse}
                disabled={voteActionsLocked}
                onCheckedChange={(v) => setCoiRecuse(v === true)}
              />
              <label htmlFor="coi-recuse" className="text-sm text-text-secondary">
                Sukladno sukobu, povlačim se (recusal)
              </label>
            </div>
            {!coiConflict ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs uppercase tracking-wide text-text-muted">
                  Bez sukoba — potvrdite sve točke
                </p>
                {[
                  [a1, setA1, "Nemam nedeklarirani sukob interesa"] as const,
                  [a2, setA2, "Nisam sudjelovao/u obuci kandidata"] as const,
                  [a3, setA3, "Nisam autor pitanja koje ugrožava nepristranost po kandidatu"] as const,
                  [
                    a4,
                    setA4,
                    "Nemam poslovni niti osobni odnos koji bi uticao na ishod za kandidata",
                  ] as const,
                ].map(([val, setter, lbl], i) => (
                  <div key={`coi-att-${String(i)}`} className="flex items-start gap-2">
                    <Checkbox
                      id={`att-${String(i)}`}
                      checked={val}
                      disabled={voteActionsLocked}
                      onCheckedChange={(v) => setter(v === true)}
                    />
                    <label htmlFor={`att-${String(i)}`} className="text-sm text-text-secondary">
                      {lbl}
                    </label>
                  </div>
                ))}
              </div>
            ) : null}
            <textarea
              value={coiComment}
              onChange={(ev) => setCoiComment(ev.target.value)}
              disabled={voteActionsLocked}
              className="mt-4 w-full rounded-md border border-border/60 bg-surface-primary p-2 text-sm"
              placeholder="Dodatan komentar (opcija)"
              rows={2}
            />
            <Button
              className="mt-3"
              onClick={() => coiMutation.mutate()}
              disabled={
                voteActionsLocked ||
                coiMutation.isPending ||
                (!coiConflict && (!a1 || !a2 || !a3 || !a4))
              }
              variant={coiConflict ? "destructive" : "default"}
            >
              {coiMutation.isPending ? "Šaljem…" : "Pošalji COI"}
            </Button>
          </section>
        ) : (
          <p className="text-sm text-text-muted">
            Aktivacije odbora dostupne su ulogama certifikacijskog komiteta i pregledu sys_admin; glasanje ima samo cert_committee.
          </p>
        )}

        {showCommitteeVoteUi ? (
          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border/50 p-4">
              <h3 className="font-semibold text-text-primary">Započni formalni pregled</h3>
              <textarea
                value={reviewNote}
                disabled={voteActionsLocked}
                onChange={(e) => setReviewNote(e.target.value)}
                className="mt-2 w-full rounded-md border border-border/60 bg-surface-primary p-2 text-sm"
                placeholder="Opcijska napomena za zapis odbora"
                rows={2}
              />
              <Button
                className="mt-3 w-full md:w-auto"
                onClick={() => startMutation.mutate()}
                disabled={startMutation.isPending || voteActionsLocked}
              >
                Start review
              </Button>
            </div>

            <div className="rounded-xl border border-border/50 p-4">
              <h3 className="font-semibold text-text-primary">Zatraži dodatne podatke</h3>
              <textarea
                value={returnComment}
                disabled={voteActionsLocked}
                onChange={(e) => setReturnComment(e.target.value)}
                className="mt-2 w-full rounded-md border border-border/60 bg-surface-primary p-2 text-sm"
                placeholder="Komentar za kandidata / operativni tim"
                rows={3}
              />
              <Button
                variant="outline"
                className="mt-3 w-full md:w-auto"
                onClick={() => returnMutation.mutate()}
                disabled={returnMutation.isPending || !returnComment.trim() || voteActionsLocked}
              >
                Request more info
              </Button>
            </div>

            <div className="rounded-xl border border-border/50 p-4">
              <h3 className="font-semibold text-text-primary text-emerald-200/95">Odobri</h3>
              <textarea
                value={approveComment}
                disabled={voteActionsLocked}
                onChange={(e) => setApproveComment(e.target.value)}
                className="mt-2 w-full rounded-md border border-border/60 bg-surface-primary p-2 text-sm"
                placeholder="Komentar uz odobrenje"
                rows={2}
              />
              <input
                value={approveLevel}
                disabled={voteActionsLocked}
                onChange={(e) => setApproveLevel(e.target.value)}
                className="mt-2 w-full rounded-md border border-border/60 bg-surface-primary p-2 text-sm"
                placeholder="Razina certifikacije (opcija)"
              />
              <Button
                className="mt-3 w-full md:w-auto"
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending || !approveComment.trim() || voteActionsLocked}
              >
                Approve i izdaj certifikaciju
              </Button>
              {approveMutation.isError ? (
                <p className="mt-2 text-sm text-red-300">
                  {formatUserFacingError(approveMutation.error).message}
                </p>
              ) : null}
              {import.meta.env.DEV && approveMutation.isError && formatUserFacingError(approveMutation.error).devDetail ? (
                <pre className="mt-2 max-h-40 overflow-auto rounded border border-border/50 bg-surface-primary/50 p-2 text-[11px] text-text-muted">
                  {formatUserFacingError(approveMutation.error).devDetail}
                </pre>
              ) : null}
            </div>

            <div className="rounded-xl border border-border/50 p-4 ring-1 ring-red-950/35">
              <h3 className="font-semibold text-red-200/95">Odbij</h3>
              <textarea
                value={rejectRationale}
                disabled={voteActionsLocked}
                onChange={(e) => setRejectRationale(e.target.value)}
                className="mt-2 w-full rounded-md border border-border/60 bg-surface-primary p-2 text-sm"
                placeholder="Razlog odbijanja za kandidata i registar žalbi"
                rows={4}
              />
              <Button
                variant="destructive"
                className="mt-3 w-full md:w-auto"
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending || !rejectRationale.trim() || voteActionsLocked}
              >
                Reject (otvara žalbenu stazu)
              </Button>
              {rejectMutation.isError ? (
                <p className="mt-2 text-sm text-red-300">
                  {formatUserFacingError(rejectMutation.error).message}
                </p>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
