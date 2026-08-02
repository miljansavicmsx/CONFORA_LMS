import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { type JSX } from "react";
import { Link, useOutletContext, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { approveCertificationScheme, fetchCertificationScheme } from "@/lib/api-certification-schemes";
import { formatApiErrorMessage } from "@/lib/format-api-error";
import { showApproveAction } from "@/lib/certification-schemes-ui-access";
import type { DashboardOutletContext } from "@/pages/dashboard/dashboard-outlet-context";

const k = (id: string) => ["certification-scheme", id] as const;

export default function CertificationSchemeApprovePage(): JSX.Element {
  const { schemeId = "" } = useParams<{ schemeId: string }>();
  const id = schemeId.trim();
  const { user } = useOutletContext<DashboardOutletContext>();
  const qc = useQueryClient();

  const q = useQuery({ queryKey: k(id), enabled: Boolean(id), queryFn: () => fetchCertificationScheme(id) });

  const allow = Boolean(q.data && showApproveAction(user.role, q.data.status));

  const mut = useMutation({
    mutationFn: () => approveCertificationScheme(id),
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
        <h2 className="text-lg font-semibold tracking-tight text-text-primary">
          Formalno odobrenje dokumentacije sheme (REVIEW → APPROVED)
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Radi se o institucijskom činu tijela za certifikaciju. Backend enforced SoD — autor sheme i član koji odobri
          ne smiju isti ako je zapis povijesnog autora dostupan • aktivacija koraka drugoga aktera traži distinkciju
          aktivatora od approvera.
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
                Ovaj obrazac vidi samo certifikacijski odbor u statusu REVIEW. Trenutno:{" "}
                <span className="font-mono">{q.data.status}</span> / uloga {user.role}.
              </p>
            ) : (
              <div className="mt-8 space-y-4">
                <div className="rounded-lg border border-border/40 bg-surface-primary/30 p-4 text-xs text-text-secondary">
                  <p>
                    Dokument referenciran schemeId-em{" "}
                    <span className="font-mono text-brand">{q.data.schemeId}</span>.
                  </p>
                  <p className="mt-2">
                    Aktivacija u ACTIVE obavlja direktor ili administracija (certification_manager) nakon što je dokument
                    u APPROVED, uz odvojeni aktivacioni korak ako je approver jednak akteru.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-sky-500/45 text-sky-100 hover:bg-sky-500/10"
                  disabled={mut.isPending}
                  onClick={() => void mut.mutate()}
                >
                  {mut.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Snimanje APPROVED…
                    </>
                  ) : (
                    "Potpisujem odluku odbora → APPROVED"
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
