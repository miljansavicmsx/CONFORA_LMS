import { useQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { Link } from "react-router";

import { fetchMyExamSessions } from "@/lib/exam-api";

/** Candidate session list. Training completion is not an eligibility gate. */
export default function ExamSessionListPage(): JSX.Element {
  const sessionsQ = useQuery({ queryKey: ["me", "exam-sessions"], queryFn: fetchMyExamSessions });
  return (
    <main className="mx-auto max-w-4xl px-4 py-10" data-testid="exam-session-list-page" aria-labelledby="exam-sessions-heading">
      <h1 id="exam-sessions-heading" className="text-2xl font-bold text-text-primary">Moji ispiti</h1>
      <p className="mt-3 text-sm text-text-secondary">
        Ispit je dostupan kada je prijava odobrena. Završena obuka i članstvo nisu uslov. Rezultat je privremen dok certifikacijski odbor ne donese odluku. Obuka nije certifikat osobe.
      </p>
      {sessionsQ.isPending ? <p role="status" className="mt-6 text-sm">Učitavanje zakazanih ispita…</p> : null}
      {sessionsQ.isError ? <p role="alert" className="mt-6 text-sm">Ispiti trenutno nisu dostupni.</p> : null}
      <ul className="mt-6 space-y-3">
        {(sessionsQ.data ?? []).map((session) => (
          <li key={session.sessionId} className="rounded-lg border border-border/50 p-3">
            <p className="font-medium text-text-primary">{session.title}</p>
            <p className="text-sm text-text-secondary">{session.status} · {new Date(session.scheduledStartAt).toLocaleString("bs")}</p>
            <Link className="mt-2 inline-block underline" to={`/dashboard/exams/sessions/${session.sessionId}`}>Otvori ispit</Link>
            {session.status === "SCORED" ? (
              <Link className="mt-2 ml-4 inline-block underline" to={`/dashboard/exams/sessions/${session.sessionId}/result`}>Rezultat</Link>
            ) : null}
          </li>
        ))}
      </ul>
      {sessionsQ.data && sessionsQ.data.length === 0 ? <p className="mt-4 text-sm text-text-secondary">Nema zakazanih ispita.</p> : null}
    </main>
  );
}
