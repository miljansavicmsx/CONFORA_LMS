import { useQuery } from "@tanstack/react-query";
import { type JSX } from "react";
import { Link } from "react-router";

import { fetchEducationDocuments, fetchExamPassDocuments, fetchMyCases } from "@/lib/case-public";

const PHASES = [
  { id: "A", phase: "ELIGIBILITY", label: "A — Prijava i podobnost" },
  { id: "B", phase: "DOSSIER", label: "B — Dosije" },
  { id: "C", phase: "COMMITTEE", label: "C — Komitet" },
  { id: "D", phase: "APPROVED_FOR_ISSUANCE", label: "D — Odobreno za izdavanje" },
  { id: "E", phase: "ISSUED", label: "E — Izdato ili odbijeno" },
] as const;

function phaseIndex(phase: string): number {
  if (phase === "ELIGIBILITY") return 0;
  if (phase === "DOSSIER") return 1;
  if (phase === "COMMITTEE") return 2;
  if (phase === "APPROVED_FOR_ISSUANCE") return 3;
  return 4;
}

export function MyCertificationDocumentsPage(): JSX.Element {
  const education = useQuery({ queryKey: ["documents", "education"], queryFn: fetchEducationDocuments });
  const exams = useQuery({ queryKey: ["documents", "exam-passes"], queryFn: fetchExamPassDocuments });
  return (
    <main className="mx-auto max-w-3xl px-4 py-10" data-testid="my-certification-documents" aria-labelledby="my-documents-heading">
      <h1 id="my-documents-heading" className="text-2xl font-semibold">Moja certifikacija</h1>
      <p className="mt-2 text-sm">EDU i EXM su potvrde. Profesionalni certifikat je poseban dokument.</p>
      <h2 className="mt-8 text-lg font-semibold">Prijave</h2>
      <p>
        <Link to="/dashboard/certification/applications">Otvorite prijave za certifikaciju</Link>
      </p>
      <h2 className="mt-8 text-lg font-semibold">Završena edukacija (EDU)</h2>
      <DocumentList
        empty="Nema EDU potvrda."
        rows={(education.data ?? []).map((row) => `${row.number} — ${row.courseTitle}`)}
      />
      <h2 className="mt-8 text-lg font-semibold">Položeni ispiti (EXM)</h2>
      <DocumentList
        empty="Nema EXM potvrda."
        rows={(exams.data ?? []).map((row) => `${row.number} — ${row.examTitle} (${row.state})`)}
      />
    </main>
  );
}

export function MyCertificationStatusPage(): JSX.Element {
  const cases = useQuery({ queryKey: ["cases", "mine"], queryFn: fetchMyCases });
  const current = cases.data?.[0];
  const active = current ? phaseIndex(current.phase) : -1;
  return (
    <main className="mx-auto max-w-3xl px-4 py-10" data-testid="my-certification-status" aria-labelledby="case-status-heading">
      <h1 id="case-status-heading" className="text-2xl font-semibold">Moja certifikacija</h1>
      <h2 className="mt-6 text-lg font-semibold">Status predmeta</h2>
      {current ? (
        <p>Predmet {current.caseId}, put {current.path}.</p>
      ) : (
        <p>Nema otvorenog predmeta.</p>
      )}
      <ol className="mt-4 space-y-2">
        {PHASES.map((phase, index) => (
          <li key={phase.id} aria-current={index === active ? "step" : undefined}>
            {phase.label}
            {index === active ? " — trenutna faza" : ""}
            {current?.phase === "DENIED" && phase.id === "E" ? " (odbijeno)" : ""}
          </li>
        ))}
      </ol>
    </main>
  );
}

function DocumentList({ empty, rows }: { readonly empty: string; readonly rows: readonly string[] }): JSX.Element {
  if (rows.length === 0) {
    return <p>{empty}</p>;
  }
  return (
    <ul>
      {rows.map((row) => (
        <li key={row}>{row}</li>
      ))}
    </ul>
  );
}
