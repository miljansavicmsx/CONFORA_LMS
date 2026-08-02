import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { type FormEvent, type JSX, useState } from "react";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { createCertificationScheme } from "@/lib/api-certification-schemes";
import { formatApiErrorMessage } from "@/lib/format-api-error";

export default function CertificationSchemeCreatePage(): JSX.Element {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [version, setVersion] = useState("1.0");
  const [level, setLevel] = useState("L3");
  const [minimumExamScore, setMinimumExamScore] = useState(70);
  const [description, setDescription] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: () =>
      createCertificationScheme({
        code: code.trim(),
        name: name.trim(),
        version: version.trim() || "1.0",
        level: level.trim(),
        minimumExamScore: Number(minimumExamScore),
        recertificationRequired: false,
        certificateValidityMonths: 36,
        committeeDecisionRequired: true,
        ...(description.trim() ? { description: description.trim() } : {}),
      }),
    onSuccess: async (row) => {
      await qc.invalidateQueries({ queryKey: ["certification-schemes"] });
      navigate(`../${row.schemeId}`, { replace: true });
    },
    onError: (e) => setErr(formatApiErrorMessage(e)),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    void mut.mutate();
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <Link to=".." className="text-xs font-semibold uppercase tracking-wide text-brand hover:underline">
        ← Povratak na registar
      </Link>

      <div className="rounded-2xl border border-border/45 bg-surface-secondary/30 p-6 ring-1 ring-white/[0.03]">
        <h2 className="text-lg font-semibold tracking-tight text-text-primary">Nova certifikacijska šema</h2>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          Kreacija otvara tehnički nacrt (DRAFT). Produkcijsko aktiviranje zahtijeva formalni životni ciklus backend ruta (
          submit-review → approve → activate).
        </p>

        {err ? <p className="mt-4 text-sm text-red-300">{err}</p> : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">schemeCode</label>
            <input
              required
              value={code}
              onChange={(ev) => setCode(ev.target.value)}
              className="mt-1 w-full rounded-lg border border-border/50 bg-surface-primary/70 px-3 py-2 font-mono text-sm text-text-primary"
              placeholder="npr. ISO-17024-ENG-L3"
              maxLength={64}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Naslov (name)</label>
            <input
              required
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              className="mt-1 w-full rounded-lg border border-border/50 bg-surface-primary/70 px-3 py-2 text-sm text-text-primary"
              placeholder="Formalni naziv sheme za tijelo certifikacije"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Verzija</label>
              <input
                value={version}
                onChange={(ev) => setVersion(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-border/50 bg-surface-primary/70 px-3 py-2 font-mono text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Razina (level)</label>
              <input
                value={level}
                onChange={(ev) => setLevel(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-border/50 bg-surface-primary/70 px-3 py-2 text-sm text-text-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Minimum scoring (ispit)</label>
            <input
              type="number"
              required
              min={0}
              max={100}
              value={minimumExamScore}
              onChange={(ev) => setMinimumExamScore(Number(ev.target.value))}
              className="mt-1 w-full rounded-lg border border-border/50 bg-surface-primary/70 px-3 py-2 text-sm text-text-primary"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Opis (opcionalno)</label>
            <textarea
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              rows={5}
              className="mt-1 w-full rounded-lg border border-border/50 bg-surface-primary/70 px-3 py-2 text-sm text-text-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Spremanje…
                </>
              ) : (
                "Spremi nacrt (DRAFT)"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("..")}>
              Odustani
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
