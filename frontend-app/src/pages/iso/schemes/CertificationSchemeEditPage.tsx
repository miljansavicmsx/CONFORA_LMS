import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { type FormEvent, type JSX, useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { fetchCertificationScheme, patchCertificationScheme } from "@/lib/api-certification-schemes";
import { formatApiErrorMessage } from "@/lib/format-api-error";
import { showEditForm } from "@/lib/certification-schemes-ui-access";
import type { DashboardOutletContext } from "@/pages/dashboard/dashboard-outlet-context";

const k = (id: string) => ["certification-scheme", id] as const;

export default function CertificationSchemeEditPage(): JSX.Element {
  const { schemeId = "" } = useParams<{ schemeId: string }>();
  const id = schemeId.trim();
  const { user } = useOutletContext<DashboardOutletContext>();
  const qc = useQueryClient();

  const q = useQuery({ queryKey: k(id), enabled: Boolean(id), queryFn: () => fetchCertificationScheme(id) });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("");
  const [ownerOrganization, setOwnerOrganization] = useState("");
  const [industrySector, setIndustrySector] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const s = q.data;
    if (!s) {
      return;
    }
    setName(s.title ?? s.name);
    setDescription(s.description ?? "");
    setScope(s.scope ?? "");
    setOwnerOrganization(s.ownerOrganization ?? "");
    setIndustrySector(s.industrySector ?? "");
  }, [q.data]);

  const okEdit = Boolean(q.data && showEditForm(user.role, q.data.status));

  const mut = useMutation({
    mutationFn: () =>
      patchCertificationScheme(id, {
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        scope: scope.trim() ? scope.trim() : null,
        ownerOrganization: ownerOrganization.trim() ? ownerOrganization.trim() : null,
        industrySector: industrySector.trim() ? industrySector.trim() : null,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: k(id) });
      await qc.invalidateQueries({ queryKey: ["certification-schemes"] });
      setErr(null);
    },
    onError: (e) => setErr(formatApiErrorMessage(e)),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    void mut.mutate();
  }

  if (!okEdit && q.data) {
    return (
      <section className="space-y-4">
        <Link to=".." className="text-brand hover:underline">
          ← Natrag na detalj
        </Link>
        <p className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Ovaj dokument nije u fazi DRAFT/REVIEW ili nemate ovlasti nacrta (admin ili quality_manager).
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
        <Link className="text-brand hover:underline" to="..">
          Detalj sheme
        </Link>
        <span aria-hidden>/</span>
        <span>Uredi</span>
      </div>

      {q.isLoading ? (
        <div className="flex items-center gap-2 text-text-secondary">
          <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
          Učitavanje…
        </div>
      ) : null}

      {!q.data ? (
        q.isError ? <p className="text-red-300">{formatApiErrorMessage(q.error)}</p> : null
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border/45 bg-surface-secondary/30 p-6">
          {err ? <p className="text-sm text-red-300">{err}</p> : null}

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Naslov</label>
            <input
              required
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              className="mt-1 w-full rounded-lg border border-border/50 bg-surface-primary/70 px-3 py-2 text-sm text-text-primary"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Opis</label>
            <textarea
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              rows={5}
              className="mt-1 w-full rounded-lg border border-border/50 bg-surface-primary/70 px-3 py-2 text-sm text-text-primary"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Vlasnička organizacija</label>
            <input
              value={ownerOrganization}
              onChange={(ev) => setOwnerOrganization(ev.target.value)}
              className="mt-1 w-full rounded-lg border border-border/50 bg-surface-primary/70 px-3 py-2 text-sm text-text-primary"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Industrijski sektor</label>
            <input
              value={industrySector}
              onChange={(ev) => setIndustrySector(ev.target.value)}
              className="mt-1 w-full rounded-lg border border-border/50 bg-surface-primary/70 px-3 py-2 text-sm text-text-primary"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Opseg dokumenta (ISO scope)</label>
            <textarea
              value={scope}
              onChange={(ev) => setScope(ev.target.value)}
              rows={6}
              className="mt-1 w-full rounded-lg border border-border/50 bg-surface-primary/70 px-3 py-2 text-sm font-mono text-text-primary leading-relaxed"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending ? "Spremanje…" : "Spremi promjene"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="..">Odustani</Link>
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
