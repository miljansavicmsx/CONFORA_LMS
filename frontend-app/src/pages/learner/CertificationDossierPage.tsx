import { useMutation, useQuery } from "@tanstack/react-query";
import { type FormEvent, type JSX, useState } from "react";

import { Button } from "@/components/ui/button";
import { fetchMyCases, openCertificationCase } from "@/lib/case-public";

/** Three documents stay distinct. Path B does not require CONFORA training. */
export default function CertificationDossierPage(): JSX.Element {
  const [schemeVersionId, setSchemeVersionId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [path, setPath] = useState<"CONFORA_EDUCATION" | "DIRECT">("DIRECT");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const casesQ = useQuery({ queryKey: ["cases", "mine"], queryFn: fetchMyCases });
  const openM = useMutation({
    mutationFn: () =>
      openCertificationCase({
        schemeVersionId,
        path,
        prerequisitesAcknowledged: true,
        certificationApplicationId: applicationId,
        experienceMonths: 0,
      }),
    onSuccess: (result) => {
      setError(null);
      setNotice(`Prijava ${result.caseId} je otvorena putem ${result.path}. Obuka CONFORA nije uslov.`);
    },
    onError: () => {
      setNotice(null);
      setError("Prijava nije otvorena. Provjerite šemu i preduslove.");
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    openM.mutate();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10" data-testid="certification-dossier-page" aria-labelledby="dossier-heading">
      <h1 id="dossier-heading" className="text-2xl font-bold text-text-primary">Kompletiraj prijavu za profesionalnu certifikaciju</h1>
      <p className="mt-3 text-sm text-text-secondary">
        Tri dokumenta nemaju isto značenje. Potvrda o edukaciji dokazuje učešće, ne kompetenciju. Potvrda o ispitu nije profesionalna certifikacija. Profesionalni certifikat slijedi tek nakon odluke.
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-text-primary">
        <li>Potvrda o završetku edukacije, prefiks EDU.</li>
        <li>Potvrda o rezultatu ispita, prefiks EXM.</li>
        <li>Profesionalni certifikat, prefiks CON, samo nakon odluke.</li>
      </ul>
      <section className="mt-8" aria-labelledby="paths-heading">
        <h2 id="paths-heading" className="text-lg font-semibold text-text-primary">Dva jednaka puta</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Put A je edukacija u CONFORA pa certifikacija. Put B je izravna certifikacija uz druge dokaze. Isti certifikat i isti kriteriji.
        </p>
      </section>
      <form className="mt-8 space-y-3" onSubmit={onSubmit} aria-labelledby="open-case-heading">
        <h2 id="open-case-heading" className="text-lg font-semibold">Osnovna prijava prije ispita</h2>
        <label className="block text-sm" htmlFor="case-scheme">Verzija šeme
          <input id="case-scheme" className="mt-1 w-full rounded border border-border px-3 py-2 font-mono" value={schemeVersionId} onChange={(event) => setSchemeVersionId(event.target.value)} required />
        </label>
        <label className="block text-sm" htmlFor="case-application">Identifikator prijave
          <input id="case-application" className="mt-1 w-full rounded border border-border px-3 py-2 font-mono" value={applicationId} onChange={(event) => setApplicationId(event.target.value)} required />
        </label>
        <label className="block text-sm" htmlFor="case-path">Put
          <select id="case-path" className="mt-1 w-full rounded border border-border px-3 py-2" value={path} onChange={(event) => setPath(event.target.value as "CONFORA_EDUCATION" | "DIRECT")}>
            <option value="DIRECT">Put B — izravna certifikacija</option>
            <option value="CONFORA_EDUCATION">Put A — edukacija pa certifikacija</option>
          </select>
        </label>
        <Button type="submit" disabled={openM.isPending}>Otvori prijavu</Button>
      </form>
      {notice ? <p className="mt-4 text-sm" role="status">{notice}</p> : null}
      {error ? <p className="mt-4 text-sm" role="alert">{error}</p> : null}
      <section className="mt-8" aria-labelledby="my-cases-heading">
        <h2 id="my-cases-heading" className="text-lg font-semibold">Moje prijave</h2>
        {casesQ.isPending ? <p className="mt-3 text-sm" role="status">Učitavanje prijava…</p> : null}
        {casesQ.isError ? <p className="mt-3 text-sm" role="alert">Prijave trenutno nisu dostupne.</p> : null}
        {casesQ.data && casesQ.data.length === 0 ? <p className="mt-3 text-sm">Još nema prijave.</p> : null}
        <ul className="mt-3 space-y-2 text-sm">
          {casesQ.data?.map((row) => (
            <li key={row.caseId} className="rounded border border-border/60 px-3 py-2">
              <span className="font-mono">{row.caseId}</span>
              <span className="ml-2">{row.path}</span>
              <span className="ml-2">{row.phase}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
