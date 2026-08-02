/**
 * Pilot — red prijava za certifikaciju (jedan preglednik, korak 10).
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useState, type ChangeEvent, type JSX } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  fetchCommitteePilotApplication,
  fetchCommitteePilotApplications,
  postCommitteePilotCoi,
  postCommitteePilotDecision,
  type CommitteePilotQueueRow,
} from "@/lib/api-committee-pilot";
import { formatUserFacingError } from "@/lib/user-facing-error";
import { cn } from "@/lib/utils";

const Q_LIST = ["committeePilot", "applications"] as const;
const qDetail = (id: string) => ["committeePilot", "application", id] as const;

function statusChip(status: string): { label: string; className: string } {
  const s = status.toUpperCase();
  if (s === "SUBMITTED") {
    return { label: "SUBMITTED", className: "border-amber-500/40 bg-amber-500/10 text-amber-100" };
  }
  if (s === "APPROVED") {
    return { label: "APPROVED", className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100" };
  }
  if (s.includes("REJECT")) {
    return { label: status, className: "border-red-500/40 bg-red-500/10 text-red-100" };
  }
  if (s.includes("INFO") || s.includes("RETURN")) {
    return { label: status, className: "border-sky-500/40 bg-sky-500/10 text-sky-100" };
  }
  return { label: status || "—", className: "border-border/50 bg-surface-primary/60 text-text-secondary" };
}

function formatError(err: unknown): string {
  return formatUserFacingError(err).message;
}

export default function CommitteePilotApplicationsPage(): JSX.Element {
  const { applicationId } = useParams<{ applicationId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [coiComment, setCoiComment] = useState("");
  const [coiNoConflict, setCoiNoConflict] = useState(false);

  const listQuery = useQuery({
    queryKey: Q_LIST,
    queryFn: fetchCommitteePilotApplications,
    enabled: !applicationId,
  });

  const detailQuery = useQuery({
    queryKey: qDetail(applicationId ?? ""),
    queryFn: () => fetchCommitteePilotApplication(applicationId ?? ""),
    enabled: Boolean(applicationId),
  });

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const coiM = useMutation({
    mutationFn: async () => {
      if (!applicationId) throw new Error("Nedostaje prijava.");
      return postCommitteePilotCoi(applicationId, {
        noConflict: coiNoConflict,
        comment: coiComment.trim(),
      });
    },
    onSuccess: async () => {
      showToast("COI je spremljen.");
      await queryClient.invalidateQueries({ queryKey: Q_LIST });
      if (applicationId) {
        await queryClient.invalidateQueries({ queryKey: qDetail(applicationId) });
      }
    },
    onError: (e: unknown) => {
      showToast(formatError(e));
    },
  });

  const decisionM = useMutation({
    mutationFn: async (decision: "APPROVE" | "REJECT" | "REQUEST_INFO") => {
      if (!applicationId) {
        throw new Error("Nedostaje prijava.");
      }
      return postCommitteePilotDecision(applicationId, { decision, comment: comment.trim() });
    },
    onSuccess: async () => {
      showToast("Odluka je spremljena.");
      await queryClient.invalidateQueries({ queryKey: Q_LIST });
      if (applicationId) {
        await queryClient.invalidateQueries({ queryKey: qDetail(applicationId) });
      }
      void navigate("/dashboard/committee/pilot-applications");
    },
    onError: (e: unknown) => {
      showToast(formatError(e));
    },
  });

  if (applicationId) {
    const row = detailQuery.data;
    const st = row ? statusChip(row.status) : null;
    const coiDone = Boolean(row?.coiCheck) || (row?.pilotCoiDeclarations?.some((d) => d.noConflict) ?? false);
    const locked =
      row &&
      ["APPROVED", "REJECTED_AFTER_DECISION", "WITHDRAWN", "ARCHIVED"].includes(row.status.toUpperCase());

    return (
      <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <Button asChild type="button" variant="ghost" className="gap-2 text-text-secondary">
            <Link to="/dashboard/committee/pilot-applications">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Natrag na red
            </Link>
          </Button>
          {detailQuery.isLoading ? (
            <div className="flex items-center gap-2 text-text-secondary">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
              Učitavanje…
            </div>
          ) : null}
          {detailQuery.isError ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200">
              <p>Ne možemo učitati prijavu.</p>
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void detailQuery.refetch()}>
                Pokušaj ponovo
              </Button>
              {import.meta.env.DEV ? (
                <pre className="mt-2 max-h-40 overflow-auto text-xs text-text-muted">{formatError(detailQuery.error)}</pre>
              ) : null}
            </div>
          ) : null}
          {row && st ? (
            <>
              <header className="space-y-2 border-b border-border/40 pb-4">
                <h1 className="text-2xl font-bold text-text-primary">Prijava {row.applicationId}</h1>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={cn("font-semibold", st.className)}>
                    {st.label}
                  </Badge>
                  <span className="text-xs text-text-muted">
                    Kandidat: {row.applicantFullName?.trim() || row.userId}
                  </span>
                  <span className="text-xs text-text-muted">Kurs: {row.courseId}</span>
                  {row.submittedAt ? (
                    <span className="text-xs text-text-muted">Predano: {row.submittedAt}</span>
                  ) : null}
                </div>
              </header>
              <section className="space-y-2 rounded-xl border border-border/40 bg-surface-secondary/40 p-4 text-sm text-text-secondary">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Ispit / dokaz</h2>
                <p>
                  Exam pass certifikat:{" "}
                  <span className="font-mono text-text-primary">{row.examPassCertificateId ?? "—"}</span>
                </p>
                <p>
                  PERSON_CERTIFICATION (ako izdan):{" "}
                  <span className="font-mono text-text-primary">{row.certificateId ?? "—"}</span>
                </p>
              </section>
              <section className="space-y-3 text-sm text-text-secondary">
                <div>
                  <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Iskustvo</h2>
                  <p className="whitespace-pre-wrap text-text-primary">{row.workExperience || "—"}</p>
                </div>
                <div>
                  <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Obrazovanje</h2>
                  <p className="whitespace-pre-wrap text-text-primary">{row.educationSummary || "—"}</p>
                </div>
                <div>
                  <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Napomene</h2>
                  <p className="whitespace-pre-wrap text-text-primary">{row.additionalNotes || "—"}</p>
                </div>
                <div>
                  <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Dokumenti</h2>
                  <ul className="list-inside list-disc space-y-1">
                    {(row.evidenceDocuments ?? []).length === 0 ? (
                      <li>—</li>
                    ) : (
                      (row.evidenceDocuments ?? []).map((d) => (
                        <li key={d.documentId} className="font-mono text-xs">
                          {(d.documentType || "dokument") + ": "}
                          {d.fileName || d.storageKey}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </section>
              <section className="space-y-3 rounded-xl border border-border/40 bg-surface-secondary/40 p-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Sukob interesa (COI)</h2>
                <p className="text-xs text-text-secondary">
                  Mora biti potvrđeno prije odobrenja. Trenutno: {coiDone ? "čisto" : "nije potvrđeno"}.
                </p>
                {(row.pilotCoiDeclarations ?? []).length > 0 ? (
                  <ul className="list-inside list-disc text-xs text-text-muted">
                    {(row.pilotCoiDeclarations ?? []).map((d) => (
                      <li key={`${d.userId}-${d.declaredAt}`}>
                        {d.userId}: {d.noConflict ? "nema sukoba" : "prijavljen sukob"} · {d.declaredAt}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {!locked ? (
                  <>
                    <label className="flex items-center gap-2 text-sm text-text-primary">
                      <input
                        type="checkbox"
                        checked={coiNoConflict}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setCoiNoConflict(e.target.checked)}
                      />
                      Potvrđujem da nemam sukob interesa u odnosu na ovu prijavu.
                    </label>
                    <Label htmlFor="pilot-coi-comment">Komentar COI</Label>
                    <textarea
                      id="pilot-coi-comment"
                      value={coiComment}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCoiComment(e.target.value)}
                      rows={2}
                      className="flex min-h-[60px] w-full rounded-md border border-border/50 bg-surface-primary/80 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={coiM.isPending}
                      onClick={() => void coiM.mutateAsync().catch(() => null)}
                    >
                      Spremi COI
                    </Button>
                  </>
                ) : null}
              </section>
              {(row.pilotDecisionHistory ?? []).length > 0 ? (
                <section className="space-y-2 rounded-xl border border-border/40 p-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Povijest odluka (pilot)</h2>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    {(row.pilotDecisionHistory ?? []).map((h, i) => (
                      <li key={`${h.at}-${i}`}>
                        <span className="font-medium text-text-primary">{h.decision}</span> · {h.byUserId} · {h.at}
                        {h.comment ? <span className="block text-text-muted">{h.comment}</span> : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {!locked ? (
                <section className="space-y-3 rounded-xl border border-border/40 bg-surface-secondary/40 p-4">
                  <Label htmlFor="pilot-comment">Komentar odbora</Label>
                  <textarea
                    id="pilot-comment"
                    value={comment}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-border/50 bg-surface-primary/80 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    placeholder="Obrazloženje odluke (preporučeno)."
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                      disabled={decisionM.isPending}
                      onClick={() => void decisionM.mutateAsync("APPROVE").catch(() => null)}
                    >
                      Odobri
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={decisionM.isPending}
                      onClick={() => void decisionM.mutateAsync("REJECT").catch(() => null)}
                    >
                      Odbij
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-sky-500/40 text-sky-100"
                      disabled={decisionM.isPending}
                      onClick={() => void decisionM.mutateAsync("REQUEST_INFO").catch(() => null)}
                    >
                      Traži dopunu
                    </Button>
                  </div>
                </section>
              ) : (
                <p className="text-sm text-text-muted">Prijava je zaključana u trenutnom statusu.</p>
              )}
            </>
          ) : null}
        </div>
        {toast ? (
          <div className="fixed bottom-6 right-6 z-[200] rounded-lg border border-border/50 bg-surface-secondary px-4 py-2 text-sm text-text-primary shadow-lg">
            {toast}
          </div>
        ) : null}
      </div>
    );
  }

  const rows: CommitteePilotQueueRow[] = listQuery.data ?? [];

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="border-b border-border/40 pb-4">
          <h1 className="text-2xl font-bold text-text-primary">Pilot — red prijava</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Pojednostavljeni pregled za člana certifikacijskog odbora (jedan odlučitelj).
          </p>
        </header>
        {listQuery.isLoading ? (
          <div className="flex items-center gap-2 text-text-secondary">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
            Učitavanje…
          </div>
        ) : null}
        {listQuery.isError ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200">
            <p>Ne možemo učitati red prijava.</p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void listQuery.refetch()}>
              Pokušaj ponovo
            </Button>
            {import.meta.env.DEV ? (
              <pre className="mt-2 max-h-40 overflow-auto text-xs text-text-muted">{formatError(listQuery.error)}</pre>
            ) : null}
          </div>
        ) : null}
        {!listQuery.isLoading && !listQuery.isError ? (
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-surface-secondary/40">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-surface-primary/40 text-xs uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3 font-semibold">Kandidat</th>
                  <th className="px-4 py-3 font-semibold">Kurs / šema</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Datum</th>
                  <th className="px-4 py-3 font-semibold">COI</th>
                  <th className="w-32 px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-text-secondary">
                      Nema prijava za pregled.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const st = statusChip(r.status);
                    const label = [r.courseTitle, r.schemeTitle].filter(Boolean).join(" · ") || "—";
                    return (
                      <tr key={r.applicationId} className="border-b border-border/30 hover:bg-surface-primary/20">
                        <td className="px-4 py-3 text-text-primary">{r.candidateName}</td>
                        <td className="px-4 py-3 text-xs text-text-secondary" title={`${r.applicationId}`}>
                          {label}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cn("font-semibold", st.className)}>
                            {st.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-text-muted">{r.submittedAt ?? "—"}</td>
                        <td className="px-4 py-3 text-xs">{r.coiCleared ? "da" : "ne"}</td>
                        <td className="px-4 py-3">
                          <Button asChild size="sm" variant="outline" className="border-border/50">
                            <Link to={`/dashboard/committee/pilot-applications/${encodeURIComponent(r.applicationId)}`}>
                              Otvori
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
