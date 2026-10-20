import { useQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { useParams } from "react-router";

import { fetchExamResult } from "@/lib/exam-api";

/** Provisional result. A pass does not issue a personnel certificate. */
export default function ExamResultPage(): JSX.Element {
  const { sessionId = "" } = useParams();
  const resultQ = useQuery({
    queryKey: ["me", "exam-result", sessionId],
    queryFn: () => fetchExamResult(sessionId),
    enabled: sessionId.length > 0,
  });
  const result = resultQ.data;
  return (
    <main className="mx-auto max-w-3xl px-4 py-10" data-testid="exam-result-page" aria-labelledby="exam-result-heading">
      <h1 id="exam-result-heading" className="text-2xl font-bold text-text-primary">Rezultat ispita</h1>
      <p className="mt-3 rounded-lg border border-amber-300/50 bg-amber-50/60 p-3 text-sm">
        Rezultat je privremen dok osoba nezavisna od obuke ne zabilježi odluku. Ovaj ekran ne izdaje certifikat.
      </p>
      {resultQ.isPending ? <p role="status" className="mt-6 text-sm">Učitavanje rezultata…</p> : null}
      {resultQ.isError ? <p role="alert" className="mt-6 text-sm">Rezultat još nije dostupan.</p> : null}
      {result ? (
        <section className="mt-6" aria-labelledby="exam-outcome-heading">
          <h2 id="exam-outcome-heading" className="text-lg font-semibold">{result.passed ? "Prag je dostignut" : "Prag nije dostignut"}</h2>
          <p className="mt-2 text-sm text-text-secondary">Bodovi: {result.scoreBasisPoints} / 10000. {result.provisional ? "Odluka odbora još nije zabilježena." : "Odluka odbora je zabilježena."}</p>
          <p className="mt-2 text-sm">{result.certificateIssued ? "Certifikat je izdat." : "Certifikat nije izdat."}</p>
          {result.domains.length > 0 ? (
            <table className="mt-4 w-full text-sm">
              <caption className="mb-2 text-left font-medium">Povrat po domeni</caption>
              <thead>
                <tr>
                  <th scope="col" className="text-left">Domena</th>
                  <th scope="col" className="text-left">Tačno</th>
                  <th scope="col" className="text-left">Ukupno</th>
                </tr>
              </thead>
              <tbody>
                {result.domains.map((domain) => (
                  <tr key={domain.domainCode}>
                    <th scope="row" className="text-left font-normal">{domain.domainCode}</th>
                    <td>{domain.correct}</td>
                    <td>{domain.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-4 text-sm text-text-secondary">Povrat po domeni prikazuje se kada prag nije dostignut.</p>
          )}
        </section>
      ) : null}
    </main>
  );
}
