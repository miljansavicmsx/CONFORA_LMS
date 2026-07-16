/**
 * Formal ISO complaints + certification appeals (admin APIs).
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Gavel, Loader2, MessageSquareWarning } from "lucide-react";
import { useCallback, useState, type JSX } from "react";

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
  adminAssignComplaint,
  adminDecideAppeal,
  fetchAdminAppealDetail,
  fetchAdminAppeals,
  fetchAdminComplaintDetail,
  fetchAdminComplaints,
  voidAppeal,
  voidComplaint,
  adminAppealAssign,
  type AppealDetail,
  type AppealListItem,
  type ComplaintDetail,
  type ComplaintListItem,
} from "@/lib/api-grievances";
import { isAppealsCanonicalEnabled } from "@/lib/api/appeals-canonical-flag";
import { isComplaintsCanonicalEnabled } from "@/lib/api/complaints-canonical-flag";
import { formatApiErrorMessage } from "@/lib/format-api-error";
import { cn } from "@/lib/utils";

function formatDate(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  try {
    return new Intl.DateTimeFormat("hr-HR", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function complaintStatusDisplay(status: string): string {
  return status.toUpperCase() === "RESOLVED" ? "CLOSED" : status;
}

const CANONICAL_COMPLAINTS = isComplaintsCanonicalEnabled();
const CANONICAL_APPEALS = isAppealsCanonicalEnabled();

export function IsoGrievancesAdminPanel(): JSX.Element {
  const qc = useQueryClient();
  const complaintsQ = useQuery({
    queryKey: ["adminComplaints"] as const,
    queryFn: fetchAdminComplaints,
  });
  const appealsQ = useQuery({
    queryKey: ["adminAppeals"] as const,
    queryFn: fetchAdminAppeals,
  });

  const [cOpen, setCOpen] = useState(false);
  const [cSel, setCSel] = useState<ComplaintListItem | null>(null);
  const [cDetail, setCDetail] = useState<ComplaintDetail | null>(null);
  const [cLoading, setCLoading] = useState(false);

  const openComplaint = useCallback(async (row: ComplaintListItem) => {
    setCSel(row);
    setCOpen(true);
    setCLoading(true);
    try {
      const d = await fetchAdminComplaintDetail(row.complaintId);
      setCDetail(d);
    } catch {
      setCDetail(null);
    } finally {
      setCLoading(false);
    }
  }, []);

  const [aOpen, setAOpen] = useState(false);
  const [aSel, setASel] = useState<AppealListItem | null>(null);
  const [aDetail, setADetail] = useState<AppealDetail | null>(null);
  const [aLoading, setALoading] = useState(false);

  const openAppeal = useCallback(async (row: AppealListItem) => {
    setASel(row);
    setAOpen(true);
    setALoading(true);
    try {
      const d = await fetchAdminAppealDetail(row.appealId);
      setADetail(d);
    } catch {
      setADetail(null);
    } finally {
      setALoading(false);
    }
  }, []);

  const [cVoidReason, setCVoidReason] = useState("");
  const [cActionErr, setCActionErr] = useState<string | null>(null);

  const acknowledgeComplaintCase = async () => {
    if (!cSel) {
      return;
    }
    setCActionErr(null);
    try {
      await adminAssignComplaint(cSel.complaintId, {});
      await qc.invalidateQueries({ queryKey: ["adminComplaints"] });
      const d = await fetchAdminComplaintDetail(cSel.complaintId);
      setCDetail(d);
    } catch (err) {
      setCActionErr(formatApiErrorMessage(err));
    }
  };

  const voidComplaintCase = async () => {
    if (!cSel || !cVoidReason.trim()) {
      return;
    }
    setCActionErr(null);
    try {
      await voidComplaint(cSel.complaintId, cVoidReason.trim());
      setCVoidReason("");
      await qc.invalidateQueries({ queryKey: ["adminComplaints"] });
      const d = await fetchAdminComplaintDetail(cSel.complaintId);
      setCDetail(d);
    } catch (err) {
      setCActionErr(formatApiErrorMessage(err));
    }
  };

  const [aVoidReason, setAVoidReason] = useState("");
  const [aActionErr, setAActionErr] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<"UPHELD" | "DISMISSED">("DISMISSED");
  const [outComment, setOutComment] = useState("");

  const acknowledgeAppealCase = async () => {
    if (!aSel) {
      return;
    }
    setAActionErr(null);
    try {
      await adminAppealAssign(aSel.appealId, {});
      await qc.invalidateQueries({ queryKey: ["adminAppeals"] });
      const d = await fetchAdminAppealDetail(aSel.appealId);
      setADetail(d);
    } catch (err) {
      setAActionErr(formatApiErrorMessage(err));
    }
  };

  const voidAppealCase = async () => {
    if (!aSel || !aVoidReason.trim()) {
      return;
    }
    setAActionErr(null);
    try {
      await voidAppeal(aSel.appealId, aVoidReason.trim());
      setAVoidReason("");
      await qc.invalidateQueries({ queryKey: ["adminAppeals"] });
      const d = await fetchAdminAppealDetail(aSel.appealId);
      setADetail(d);
    } catch (err) {
      setAActionErr(formatApiErrorMessage(err));
    }
  };

  const decideAppeal = async () => {
    if (!aSel || !outComment.trim()) {
      return;
    }
    setAActionErr(null);
    try {
      await adminDecideAppeal(aSel.appealId, {
        outcome,
        outcomeComment: outComment.trim(),
        resolutionCommitteeId: "appeals_committee",
      });
      await qc.invalidateQueries({ queryKey: ["adminAppeals"] });
      const d = await fetchAdminAppealDetail(aSel.appealId);
      setADetail(d);
    } catch (err) {
      setAActionErr(formatApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-12">
      <section>
        <div className="mb-4 flex items-center gap-3">
          <MessageSquareWarning className="h-6 w-6 text-brand" aria-hidden />
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Formalni predmeti (pritužbe / prijedlozi)</h2>
            <p className="text-sm text-text-secondary">
              API: {CANONICAL_COMPLAINTS ? "/v1/staff/complaints" : "/v1/admin/complaints (alias)"} — B15 kanonski
              tijek.
            </p>
          </div>
        </div>
        {complaintsQ.isError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            <p className="font-medium">Nije moguće učitati prigovore.</p>
            <p className="mt-2 text-red-200/90">{formatApiErrorMessage(complaintsQ.error)}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 border-red-500/40 text-red-100 hover:bg-red-500/15"
              onClick={() => {
                void complaintsQ.refetch();
              }}
            >
              Pokušaj ponovo
            </Button>
          </div>
        ) : (
        <div className="overflow-hidden rounded-xl border border-border/50 bg-surface-primary/60">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-surface-secondary/80">
                <th className="px-3 py-2.5 font-semibold text-text-muted">Datum</th>
                <th className="px-3 py-2.5 font-semibold text-text-muted">Kategorija</th>
                <th className="px-3 py-2.5 font-semibold text-text-muted">Predmet</th>
                <th className="px-3 py-2.5 font-semibold text-text-muted">Status</th>
                <th className="px-3 py-2.5 text-right font-semibold text-text-muted">Otvori</th>
              </tr>
            </thead>
            <tbody>
              {complaintsQ.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-12 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand" />
                  </td>
                </tr>
              ) : (complaintsQ.data?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-text-secondary">
                    Nema prigovora za prikaz.
                  </td>
                </tr>
              ) : (
                complaintsQ.data?.map((row) => (
                  <tr key={row.complaintId} className="border-b border-border/30 hover:bg-surface-secondary/40">
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">{formatDate(row.createdAt)}</td>
                    <td className="px-3 py-2.5 text-xs">{row.category}</td>
                    <td className="max-w-[280px] px-3 py-2.5">
                      <p className="line-clamp-2 font-medium">{row.subject}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" className="text-xs font-normal">
                        {complaintStatusDisplay(row.status)}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Button type="button" size="sm" variant="secondary" onClick={() => void openComplaint(row)}>
                        Detalji
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-3">
          <Gavel className="h-6 w-6 text-amber-400" aria-hidden />
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Žalbe na certifikacijske odluke</h2>
            <p className="text-sm text-text-secondary">
              API: {CANONICAL_APPEALS ? "/v1/staff/appeals" : "/v1/admin/appeals (alias)"} — B14 kanonski
              tijek.
            </p>
          </div>
        </div>
        {appealsQ.isError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            <p className="font-medium">Nije moguće učitati žalbe.</p>
            <p className="mt-2 text-red-200/90">{formatApiErrorMessage(appealsQ.error)}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 border-red-500/40 text-red-100 hover:bg-red-500/15"
              onClick={() => {
                void appealsQ.refetch();
              }}
            >
              Pokušaj ponovo
            </Button>
          </div>
        ) : (
        <div className="overflow-hidden rounded-xl border border-border/50 bg-surface-primary/60">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-surface-secondary/80">
                <th className="px-3 py-2.5 font-semibold text-text-muted">Datum</th>
                <th className="px-3 py-2.5 font-semibold text-text-muted">Odluka</th>
                <th className="px-3 py-2.5 font-semibold text-text-muted">Status</th>
                <th className="px-3 py-2.5 text-right font-semibold text-text-muted">Otvori</th>
              </tr>
            </thead>
            <tbody>
              {appealsQ.isLoading ? (
                <tr>
                  <td colSpan={4} className="px-3 py-12 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand" />
                  </td>
                </tr>
              ) : (appealsQ.data?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-10 text-center text-text-secondary">
                    Nema žalbi za prikaz.
                  </td>
                </tr>
              ) : (
                appealsQ.data?.map((row) => (
                  <tr key={row.appealId} className="border-b border-border/30 hover:bg-surface-secondary/40">
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">{formatDate(row.createdAt)}</td>
                    <td className="px-3 py-2.5 font-mono text-xs">{row.certificationDecisionId.slice(0, 12)}…</td>
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" className="text-xs font-normal">
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Button type="button" size="sm" variant="secondary" onClick={() => void openAppeal(row)}>
                        Detalji
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}
      </section>

      <Dialog
        open={cOpen}
        onOpenChange={(o) => {
          setCOpen(o);
          if (!o) {
            setCSel(null);
            setCDetail(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-surface-primary sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Predmet</DialogTitle>
            <DialogDescription>{cSel?.subject}</DialogDescription>
          </DialogHeader>
          {cLoading ? (
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand" />
          ) : cDetail ? (
            <div className="space-y-4 text-sm">
              <p className="whitespace-pre-wrap text-text-secondary">{cDetail.description}</p>
              {cDetail.publicReference ? (
                <p className="text-xs text-text-muted">
                  Javna referenca: <span className="font-mono text-text-primary">{cDetail.publicReference}</span>
                </p>
              ) : null}
              {cActionErr ? <p className="text-sm text-red-300">{cActionErr}</p> : null}
              {CANONICAL_COMPLAINTS ? (
                <div className="space-y-3 border-t border-border/40 pt-4">
                  <Button type="button" size="sm" variant="secondary" onClick={() => void acknowledgeComplaintCase()}>
                    Potvrdi primitak (acknowledge)
                  </Button>
                  <div>
                    <Label>Razlog storniranja (void)</Label>
                    <textarea
                      value={cVoidReason}
                      onChange={(e) => setCVoidReason(e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm"
                    />
                  </div>
                  <Button type="button" size="sm" variant="destructive" onClick={() => void voidComplaintCase()}>
                    Storniraj predmet
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-amber-200/90">
                  Mutacije su dostupne samo s uključenim kanonskim B15 rutama (VITE_COMPLAINTS_CANONICAL_ENABLED=true).
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-red-300">Učitavanje nije uspjelo.</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={aOpen}
        onOpenChange={(o) => {
          setAOpen(o);
          if (!o) {
            setASel(null);
            setADetail(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-surface-primary sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Žalba na odluku</DialogTitle>
            <DialogDescription className="font-mono text-xs">{aSel?.appealId}</DialogDescription>
          </DialogHeader>
          {aLoading ? (
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand" />
          ) : aDetail ? (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-text-muted">Sažetak</p>
                <p className="text-text-primary">{aDetail.summary}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Obrazloženje</p>
                <p className="whitespace-pre-wrap text-text-secondary">{aDetail.grounds}</p>
              </div>
              {aDetail.candidateReference ? (
                <p className="text-xs text-text-muted">
                  Referenca: <span className="font-mono text-text-primary">{aDetail.candidateReference}</span>
                </p>
              ) : null}
              {aDetail.outcome ? (
                <div className={cn("rounded-lg border p-3 text-sm", "border-emerald-500/30 bg-emerald-500/10")}>
                  <p className="font-medium text-emerald-100">Odluka: {aDetail.outcome}</p>
                  {aDetail.outcomeComment ? (
                    <p className="mt-2 whitespace-pre-wrap text-emerald-100/90">{aDetail.outcomeComment}</p>
                  ) : null}
                </div>
              ) : null}
              {aActionErr ? <p className="text-sm text-red-300">{aActionErr}</p> : null}
              {CANONICAL_APPEALS ? (
                <>
                  <div className="space-y-3 border-t border-border/40 pt-4">
                    <Button type="button" size="sm" variant="secondary" onClick={() => void acknowledgeAppealCase()}>
                      Potvrdi primitak (acknowledge)
                    </Button>
                    <div>
                      <Label>Razlog storniranja (void)</Label>
                      <textarea
                        value={aVoidReason}
                        onChange={(e) => setAVoidReason(e.target.value)}
                        rows={3}
                        className="mt-1 w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm"
                      />
                    </div>
                    <Button type="button" size="sm" variant="destructive" onClick={() => void voidAppealCase()}>
                      Storniraj žalbu
                    </Button>
                  </div>
                  {!aDetail.outcome && aDetail.status !== "CLOSED" && aDetail.status !== "WITHDRAWN" && aDetail.status !== "VOIDED" ? (
                    <div className="space-y-3 border-t border-border/40 pt-4">
                      <p className="text-xs font-semibold uppercase text-text-muted">Donošenje odluke (B14)</p>
                      <select
                        value={outcome}
                        onChange={(e) => setOutcome(e.target.value as "UPHELD" | "DISMISSED")}
                        className="h-9 w-full max-w-xs rounded-md border border-border/60 bg-surface-secondary/80 px-2 text-sm"
                      >
                        <option value="UPHELD">UPHELD (prihvaćeno)</option>
                        <option value="DISMISSED">DISMISSED (odbijeno)</option>
                      </select>
                      <div>
                        <Label>Komentar odluke</Label>
                        <textarea
                          value={outComment}
                          onChange={(e) => setOutComment(e.target.value)}
                          rows={4}
                          className="mt-1 w-full rounded-md border border-border/60 bg-surface-secondary/80 px-3 py-2 text-sm"
                        />
                      </div>
                      <Button type="button" className="bg-amber-800 hover:bg-amber-800/90" onClick={() => void decideAppeal()}>
                        Zabilježi odluku
                      </Button>
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="text-xs text-amber-200/90">
                  Mutacije su dostupne samo s uključenim kanonskim B14 rutama (VITE_APPEALS_CANONICAL_ENABLED=true).
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-red-300">Učitavanje nije uspjelo.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
