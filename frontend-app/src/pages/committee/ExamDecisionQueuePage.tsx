import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, type JSX, useState } from "react";

import { Button } from "@/components/ui/button";
import { fetchDecisionQueue, recordExamDecision } from "@/lib/exam-api";

/** Human certification decision. The maker must be independent of the candidate's training. */
export default function ExamDecisionQueuePage(): JSX.Element {
  const queryClient = useQueryClient();
  const [resultId, setResultId] = useState("");
  const [outcome, setOutcome] = useState<"GRANT" | "DENY">("DENY");
  const [rationale, setRationale] = useState("");
  const queueQ = useQuery({ queryKey: ["committee", "exam-queue"], queryFn: fetchDecisionQueue });
  const decideM = useMutation({
    mutationFn: () => recordExamDecision({ resultId, outcome, rationale }),
    onSuccess: () => {
      setRationale("");
      void queryClient.invalidateQueries({ queryKey: ["committee", "exam-queue"] });
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    decideM.mutate();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10" data-testid="exam-decision-queue-page" aria-labelledby="decision-queue-heading">
      <h1 id="decision-queue-heading" className="text-2xl font-bold text-text-primary">Red odluka o certifikaciji</h1>
      <p className="mt-3 text-sm text-text-secondary">
        Odluku zapisuje član certifikacijskog odbora koji nije kandidat i nije trener tog kandidata. Zapis ne izdaje certifikat. Proktorski signal ne mijenja bodove.
      </p>
      {queueQ.isPending ? <p role="status" className="mt-6 text-sm">Učitavanje reda…</p> : null}
      {queueQ.isError ? <p role="alert" className="mt-6 text-sm">Red odluka trenutno nije dostupan.</p> : null}
      <table className="mt-6 w-full text-sm">
        <caption className="mb-2 text-left font-medium">Privremeni rezultati bez odluke</caption>
        <thead>
          <tr>
            <th scope="col" className="text-left">Šema</th>
            <th scope="col" className="text-left">Prag</th>
            <th scope="col" className="text-left">Bodovi</th>
            <th scope="col" className="text-left">Rezultat</th>
          </tr>
        </thead>
        <tbody>
          {(queueQ.data ?? []).map((row) => (
            <tr key={row.resultId}>
              <th scope="row" className="text-left font-normal">{row.schemeCode}</th>
              <td>{row.passed ? "dostignut" : "nije dostignut"}</td>
              <td>{row.scoreBasisPoints}</td>
              <td><button type="button" className="underline" onClick={() => setResultId(row.resultId)}>Odaberi</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {queueQ.data && queueQ.data.length === 0 ? <p className="mt-3 text-sm text-text-secondary">Nema rezultata koji čekaju odluku.</p> : null}
      <form className="mt-8 space-y-3" onSubmit={onSubmit} aria-labelledby="decision-form-heading">
        <h2 id="decision-form-heading" className="text-lg font-semibold">Zapiši odluku</h2>
        <label className="block text-sm" htmlFor="result-id">Identifikator rezultata
          <input id="result-id" className="mt-1 w-full rounded border border-border px-3 py-2" value={resultId} onChange={(event) => setResultId(event.target.value)} required />
        </label>
        <label className="block text-sm" htmlFor="decision-outcome">Ishod
          <select id="decision-outcome" className="mt-1 w-full rounded border border-border px-3 py-2" value={outcome} onChange={(event) => setOutcome(event.target.value as "GRANT" | "DENY")}>
            <option value="GRANT">Dodijeli</option>
            <option value="DENY">Ne dodijeli</option>
          </select>
        </label>
        <label className="block text-sm" htmlFor="decision-rationale">Obrazloženje
          <textarea id="decision-rationale" className="mt-1 w-full rounded border border-border px-3 py-2" value={rationale} onChange={(event) => setRationale(event.target.value)} required rows={4} />
        </label>
        <Button type="submit" disabled={decideM.isPending}>Zabilježi odluku</Button>
        {decideM.isSuccess ? <p role="status" className="text-sm">Odluka je zabilježena. Certifikat nije izdat.</p> : null}
        {decideM.isError ? <p role="alert" className="text-sm">Odluka nije zabilježena. Trener kandidata i sam kandidat ne mogu odlučivati.</p> : null}
      </form>
    </main>
  );
}
