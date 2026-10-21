import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, type JSX, useState } from "react";

import { Button } from "@/components/ui/button";
import { fetchDecisionQueue, recordExamDecision } from "@/lib/exam-api";
import {
  changePersonnelCertificateStatus,
  issuePersonnelCertificate,
  proposePersonnelAmfSuspension,
} from "@/lib/personnel-public";

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
      <CertificateIssuancePanel />
    </main>
  );
}

function CertificateIssuancePanel(): JSX.Element {
  const [decisionId, setDecisionId] = useState("");
  const [holderName, setHolderName] = useState("");
  const [consent, setConsent] = useState(false);
  const [credentialId, setCredentialId] = useState("");
  const [toStatus, setToStatus] = useState<"ACTIVE" | "SUSPENDED" | "WITHDRAWN">("SUSPENDED");
  const [reason, setReason] = useState("");
  const [amfReason, setAmfReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const issueM = useMutation({
    mutationFn: () => issuePersonnelCertificate({
      decisionId,
      holderDisplayName: holderName,
      registryConsent: consent,
    }),
    onSuccess: (issued) => {
      setError(null);
      setCredentialId(issued.credentialId);
      setNotice(`Certifikat ${issued.certificateNumber} je izdat. Status: ${issued.status}. Odluka sama nije izdala certifikat.`);
    },
    onError: () => {
      setNotice(null);
      setError("Izdavanje nije uspjelo. Potrebna je odluka GRANT, a izdavalac ne smije biti kandidat ni trener.");
    },
  });

  const statusM = useMutation({
    mutationFn: () => changePersonnelCertificateStatus(credentialId, { toStatus, reason }),
    onSuccess: (changed) => {
      setError(null);
      setNotice(`Status je promijenjen. Javni status: ${changed.publicStatus}.`);
    },
    onError: () => {
      setNotice(null);
      setError("Status nije promijenjen. Promjenu može izvršiti samo ovlaštena osoba, uz razlog.");
    },
  });

  const amfM = useMutation({
    mutationFn: () => proposePersonnelAmfSuspension(credentialId, amfReason),
    onSuccess: (proposal) => {
      setError(null);
      setNotice(proposal.suspended
        ? "Prijedlog je zabilježen."
        : "Prijedlog suspenzije zbog AMF-a je zabilježen. Certifikat nije suspendovan.");
    },
    onError: () => {
      setNotice(null);
      setError("Prijedlog AMF suspenzije nije zabilježen.");
    },
  });

  return (
    <section className="mt-10 space-y-8" aria-labelledby="issuance-heading" data-testid="certificate-issuance-panel">
      <div>
        <h2 id="issuance-heading" className="text-lg font-semibold">Izdavanje certifikata osoblja</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Ovlaštena osoba izdaje certifikat tek nakon odluke GRANT. Osoba koja je zapisala ili potvrdila odluku ne smije izdati certifikat. Valjanost je tri godine. Pristanak određuje da li se ime pojavljuje u pretrazi registra.
        </p>
      </div>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          issueM.mutate();
        }}
      >
        <label className="block text-sm" htmlFor="issue-decision-id">Identifikator odluke
          <input id="issue-decision-id" className="mt-1 w-full rounded border border-border px-3 py-2 font-mono" value={decisionId} onChange={(event) => setDecisionId(event.target.value)} required data-testid="issue-decision-id" />
        </label>
        <label className="block text-sm" htmlFor="issue-holder-name">Ime na certifikatu
          <input id="issue-holder-name" className="mt-1 w-full rounded border border-border px-3 py-2" value={holderName} onChange={(event) => setHolderName(event.target.value)} required data-testid="issue-holder-name" />
        </label>
        <label className="flex items-start gap-2 text-sm" htmlFor="issue-registry-consent">
          <input id="issue-registry-consent" type="checkbox" className="mt-1" checked={consent} onChange={(event) => setConsent(event.target.checked)} data-testid="issue-registry-consent" />
          <span>Pristanak za javni registar: ime, šema, status i datumi.</span>
        </label>
        <Button type="submit" disabled={issueM.isPending}>Izdaj certifikat</Button>
      </form>
      <form
        className="space-y-3"
        aria-labelledby="status-change-heading"
        onSubmit={(event) => {
          event.preventDefault();
          statusM.mutate();
        }}
      >
        <h3 id="status-change-heading" className="text-base font-semibold">Promjena statusa</h3>
        <p className="text-sm text-text-secondary">Samo ovlaštena osoba, uz razlog. Istek se ne postavlja ručno.</p>
        <label className="block text-sm" htmlFor="status-credential-id">Identifikator certifikata
          <input id="status-credential-id" className="mt-1 w-full rounded border border-border px-3 py-2 font-mono" value={credentialId} onChange={(event) => setCredentialId(event.target.value)} required />
        </label>
        <label className="block text-sm" htmlFor="status-target">Novi status
          <select id="status-target" className="mt-1 w-full rounded border border-border px-3 py-2" value={toStatus} onChange={(event) => setToStatus(event.target.value as "ACTIVE" | "SUSPENDED" | "WITHDRAWN")}>
            <option value="SUSPENDED">Suspendovan</option>
            <option value="ACTIVE">Važeći</option>
            <option value="WITHDRAWN">Povučen</option>
          </select>
        </label>
        <label className="block text-sm" htmlFor="status-reason">Razlog
          <textarea id="status-reason" className="mt-1 w-full rounded border border-border px-3 py-2" value={reason} onChange={(event) => setReason(event.target.value)} required rows={3} />
        </label>
        <Button type="submit" disabled={statusM.isPending}>Promijeni status</Button>
      </form>
      <form
        className="space-y-3"
        aria-labelledby="amf-heading"
        onSubmit={(event) => {
          event.preventDefault();
          amfM.mutate();
        }}
      >
        <h3 id="amf-heading" className="text-base font-semibold">Prijedlog suspenzije zbog AMF-a</h3>
        <p className="text-sm text-text-secondary">Neplaćena članarina samo predlaže suspenziju. Ne mijenja status certifikata.</p>
        <label className="block text-sm" htmlFor="amf-reason">Razlog prijedloga
          <textarea id="amf-reason" className="mt-1 w-full rounded border border-border px-3 py-2" value={amfReason} onChange={(event) => setAmfReason(event.target.value)} required rows={3} />
        </label>
        <Button type="submit" disabled={amfM.isPending || !credentialId}>Predloži suspenziju</Button>
      </form>
      {notice ? <p role="status" className="text-sm" data-testid="issuance-notice">{notice}</p> : null}
      {error ? <p role="alert" className="text-sm">{error}</p> : null}
    </section>
  );
}
