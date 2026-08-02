import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { type JSX } from "react";
import { Link, useOutletContext, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { fetchCertificationScheme, submitCertificationSchemeReview } from "@/lib/api-certification-schemes";
import { formatApiErrorMessage } from "@/lib/format-api-error";
import { showSubmitReviewAction } from "@/lib/certification-schemes-ui-access";
import type { DashboardOutletContext } from "@/pages/dashboard/dashboard-outlet-context";

const k = (id: string) => ["certification-scheme", id] as const;

export default function CertificationSchemeReviewPage(): JSX.Element {
  const { schemeId = "" } = useParams<{ schemeId: string }>();
  const id = schemeId.trim();
  const { user } = useOutletContext<DashboardOutletContext>();
  const qc = useQueryClient();

  const q = useQuery({ queryKey: k(id), enabled: Boolean(id), queryFn: () => fetchCertificationScheme(id) });

  const allow = Boolean(q.data && showSubmitReviewAction(user.role, q.data.status));

  const mut = useMutation({
    mutationFn: () => submitCertificationSchemeReview(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: k(id) });
      await qc.invalidateQueries({ queryKey: ["certification-schemes"] });
    },
  });

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <Link to=".." className="text-xs font-semibold uppercase tracking-wide text-brand hover:underline">
        ← Natrag na detalj
      </Link>

      <div className="rounded-2xl border border-border/45 bg-surface-secondary/30 p-6 ring-1 ring-white/[0.03]">
        <h2 className="text-lg font-semibold tracking-tight text-text-primary">Formalni prijenos u REVIEW</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Ova akcija (DRAFT → REVIEW) označava da je tehnička definicija spremna za presudu certifikacijskog odbora. U
          REVIEW fazama sadržaj se još može tehnički dotjerati uz uloge nacrta.
        </p>

        {q.isLoading ? (
          <div className="mt-6 flex items-center gap-2 text-text-secondary">
            <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
            Učitavanje stanja...
          </div>
        ) : null}

        {q.data ? (
          <>
            {!allow ? (
              <p className="mt-6 rounded-lg border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                Nedostupno: potreban je DRAFT i uloga admin ili quality_manager. Trenutni status:{" "}
                <span className="font-mono">{q.data.status}</span>.
              </p>
            ) : (
              <div className="mt-8 space-y-4">
                <p className="text-xs uppercase tracking-wide text-text-muted">
                  Aktualna oznaka: <span className="font-mono text-text-secondary">{q.data.schemeCode ?? q.data.code}</span>
                </p>
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  disabled={mut.isPending}
                  onClick={() => void mut.mutate()}
                >
                  {mut.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Prijenos u REVIEW…
                    </>
                  ) : (
                    "Potvrđujem spremnost — pošalji na pregled odboru"
                  )}
                </Button>
                {mut.isError ? <p className="text-sm text-red-300">{formatApiErrorMessage(mut.error)}</p> : null}
              </div>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
