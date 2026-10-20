import { useMutation, useQuery } from "@tanstack/react-query";
import { type FormEvent, type JSX, useState } from "react";
import { useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { fetchCommitteeCase, suggestForCase } from "@/lib/case-public";

const exclusionLabel: Record<string, string> = {
  TRAINER: "Trener kandidata (9.4.4)",
  EXAMINER: "Ispitivač kandidata (9.4.4)",
  CANDIDATE: "Kandidat",
  CONFLICT: "Sukob interesa",
  AUTHORISATION: "Ovlaštenje nije važeće",
};

/** Electronic case file. Issuance is a different person from the decision. */
export default function CaseFilePage(): JSX.Element {
  const [params] = useSearchParams();
  const [caseId, setCaseId] = useState(params.get("caseId") ?? "");
  const [loadedId, setLoadedId] = useState(params.get("caseId") ?? "");
  const caseQ = useQuery({
    queryKey: ["committee", "case", loadedId],
    queryFn: () => fetchCommitteeCase(loadedId),
    enabled: loadedId.length > 0,
  });
  const assistM = useMutation({
    mutationFn: () => suggestForCase(loadedId, "summary"),
  });

  function onLoad(event: FormEvent) {
    event.preventDefault();
    setLoadedId(caseId.trim());
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10" data-testid="case-file-page" aria-labelledby="case-file-heading">
      <h1 id="case-file-heading" className="text-2xl font-bold text-text-primary">Elektronski predmet</h1>
      <p className="mt-3 text-sm text-text-secondary">
        Odbor ne bira nivo. Nivo slijedi iz kriterija šeme. Izdavanje odobrava druga osoba, koja nije zapisala ni potvrdila odluku, i provjerava samo administrativnu ispravnost.
      </p>
      <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={onLoad}>
        <label className="block flex-1 text-sm" htmlFor="case-file-id">Identifikator predmeta
          <input id="case-file-id" className="mt-1 w-full rounded border border-border px-3 py-2 font-mono" value={caseId} onChange={(event) => setCaseId(event.target.value)} required />
        </label>
        <Button type="submit">Otvori predmet</Button>
      </form>
      {caseQ.isPending && loadedId ? <p className="mt-6 text-sm" role="status">Učitavanje predmeta…</p> : null}
      {caseQ.isError ? <p className="mt-6 text-sm" role="alert">Predmet nije dostupan.</p> : null}
      {caseQ.data ? (
        <section className="mt-6 space-y-4" aria-labelledby="case-summary-heading" data-testid="case-file-result">
          <h2 id="case-summary-heading" className="text-lg font-semibold">{caseQ.data.scheme}</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-text-muted">Put</dt><dd>{caseQ.data.path}</dd></div>
            <div><dt className="text-text-muted">Faza</dt><dd>{caseQ.data.phase}</dd></div>
            <div><dt className="text-text-muted">Izračunati nivo</dt><dd>{caseQ.data.computedLevelCode ?? caseQ.data.eligibleLevel ?? "—"}</dd></div>
            <div><dt className="text-text-muted">Obuka kao uslov</dt><dd>ne</dd></div>
          </dl>
          <h3 className="text-base font-semibold">Sastav odbora</h3>
          <ul className="space-y-2 text-sm">
            {caseQ.data.proposals.map((slot) => (
              <li key={slot.userId} className="rounded border border-border/60 px-3 py-2">
                <span className="font-mono">{slot.userId}</span>
                <span className="ml-2">{slot.state}</span>
                {slot.exclusionReason ? <span className="ml-2">{exclusionLabel[slot.exclusionReason] ?? slot.exclusionReason}</span> : null}
              </li>
            ))}
          </ul>
          <h3 className="text-base font-semibold">Dokazi i reference</h3>
          <ul className="space-y-2 text-sm">
            {caseQ.data.evidence.map((item) => (
              <li key={item.id}>{item.kind}: {item.title}</li>
            ))}
            {caseQ.data.referees.map((referee) => (
              <li key={referee.id}>
                {referee.refereeName}, {referee.organization}, {referee.state}. Potvrda sama ne ispunjava uslov.
              </li>
            ))}
          </ul>
          <Button type="button" onClick={() => assistM.mutate()} disabled={assistM.isPending}>Prijedlog sažetka</Button>
          {assistM.data ? (
            <p className="text-sm" role="status" data-testid="ai-suggestion">
              {assistM.data.label}: {assistM.data.suggestion}
            </p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
