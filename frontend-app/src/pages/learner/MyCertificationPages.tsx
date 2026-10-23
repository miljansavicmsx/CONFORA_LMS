import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type JSX } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { getConforaApiConfig, joinBaseUrlAndPath } from "@/lib/api/api-config";
import {
  fetchEducationDocuments,
  fetchExamPassDocuments,
  fetchMyCases,
  setDocumentNameConsent,
} from "@/lib/case-public";

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

function publicPdfHref(verificationId: string): string {
  return joinBaseUrlAndPath(
    getConforaApiConfig().nestBaseUrl,
    `/v1/public/documents/${encodeURIComponent(verificationId)}/pdf`,
  );
}

export function MyCertificationDocumentsPage(): JSX.Element {
  const qc = useQueryClient();
  const education = useQuery({ queryKey: ["documents", "education"], queryFn: fetchEducationDocuments });
  const exams = useQuery({ queryKey: ["documents", "exam-passes"], queryFn: fetchExamPassDocuments });
  const consent = useMutation({
    mutationFn: (input: { verificationId: string; granted: boolean }) =>
      setDocumentNameConsent(input.verificationId, input.granted),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["documents"] });
    },
  });
  return (
    <main className="mx-auto max-w-3xl px-4 py-10" data-testid="my-certification-documents" aria-labelledby="my-documents-heading">
      <h1 id="my-documents-heading" className="text-2xl font-semibold">Moja certifikacija</h1>
      <p className="mt-2 text-sm">EDU i EXM su potvrde. Profesionalni certifikat je poseban dokument. Javni PDF ne prikazuje rezultat ispita.</p>
      <h2 className="mt-8 text-lg font-semibold">Prijave</h2>
      <p>
        <Link to="/dashboard/certification/applications">Otvorite prijave za certifikaciju</Link>
      </p>
      <h2 className="mt-8 text-lg font-semibold">Certifikati osoblja</h2>
      <p>
        <Link to="/dashboard/my-certificates">Otvorite moje certifikate</Link>
      </p>
      <h2 className="mt-8 text-lg font-semibold">Završena edukacija (EDU)</h2>
      <DocumentCards
        empty="Nema EDU potvrda."
        rows={(education.data ?? []).map((row) => ({
          id: row.documentId,
          title: `${row.number} — ${row.courseTitle}`,
          verificationId: row.verificationId,
          nameConsent: row.nameConsent,
        }))}
        busy={consent.isPending}
        onConsent={(verificationId, granted) => consent.mutate({ verificationId, granted })}
      />
      <h2 className="mt-8 text-lg font-semibold">Ispiti (EXM)</h2>
      <DocumentCards
        empty="Nema EXM potvrda."
        rows={(exams.data ?? []).map((row) => ({
          id: row.attestationId,
          title: `${row.number} — ${row.examTitle} (${row.state})`,
          verificationId: row.verificationId,
          nameConsent: row.nameConsent,
        }))}
        busy={consent.isPending}
        onConsent={(verificationId, granted) => consent.mutate({ verificationId, granted })}
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

function DocumentCards({
  empty,
  rows,
  busy,
  onConsent,
}: {
  readonly empty: string;
  readonly rows: readonly { id: string; title: string; verificationId: string; nameConsent: boolean }[];
  readonly busy: boolean;
  readonly onConsent: (verificationId: string, granted: boolean) => void;
}): JSX.Element {
  if (rows.length === 0) {
    return <p>{empty}</p>;
  }
  return (
    <ul className="mt-3 space-y-3">
      {rows.map((row) => (
        <li key={row.id} className="rounded-lg border border-border/50 p-3 text-sm" data-testid={`my-document-${row.id}`}>
          <p className="font-medium">{row.title}</p>
          <p className="mt-1 text-text-secondary">Javno ime: {row.nameConsent ? "pristanak je dat" : "nije objavljeno"}</p>
          <p className="mt-2 flex flex-wrap gap-3">
            <Link className="text-brand underline" to={`/verify/${encodeURIComponent(row.verificationId)}`}>Javna provjera</Link>
            <a className="text-brand underline" href={publicPdfHref(row.verificationId)}>Preuzmi javni PDF</a>
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => onConsent(row.verificationId, !row.nameConsent)}>
              {row.nameConsent ? "Povuci pristanak za ime" : "Daj pristanak za ime"}
            </Button>
          </p>
        </li>
      ))}
    </ul>
  );
}
