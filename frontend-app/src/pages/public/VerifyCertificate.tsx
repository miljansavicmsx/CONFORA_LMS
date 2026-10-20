import { useEffect, useState, type JSX } from "react";
import { Link, useParams } from "react-router";

import { verifyCertificate, type VerifiedCertificatePublic } from "@/lib/api-certificates";
import { fetchPublicCaseDocument, isEducationOrExamNumber, type PublicCaseDocument } from "@/lib/case-public";
import {
  fetchPublicPersonnelCertificate,
  formatPersonnelDate,
  isPersonnelCertificateNumber,
  personnelStatusLabel,
  type PublicPersonnelRecord,
} from "@/lib/personnel-public";

type HashState =
  | { readonly kind: "loading" }
  | { readonly kind: "invalid" }
  | { readonly kind: "not_found" }
  | { readonly kind: "error" }
  | { readonly kind: "result"; readonly certificate: VerifiedCertificatePublic };

type PersonnelState =
  | { readonly kind: "loading" }
  | { readonly kind: "not_found" }
  | { readonly kind: "rate_limited" }
  | { readonly kind: "error" }
  | { readonly kind: "result"; readonly certificate: PublicPersonnelRecord };

function isHash(value: string | undefined): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/iu.test(value);
}

function displayDate(value: string | null): string {
  return value?.trim() || "Not published";
}

function statusLabel(certificate: VerifiedCertificatePublic): string {
  return certificate.effectiveStatus ?? certificate.verificationResult ?? certificate.status;
}

function HashVerification({ verificationHash }: { readonly verificationHash: string | undefined }): JSX.Element {
  const [state, setState] = useState<HashState>(() => (isHash(verificationHash) ? { kind: "loading" } : { kind: "invalid" }));

  useEffect(() => {
    if (!isHash(verificationHash)) {
      setState({ kind: "invalid" });
      return;
    }

    let active = true;
    setState({ kind: "loading" });
    void verifyCertificate(verificationHash).then((result) => {
      if (!active) return;
      if (result.kind === "ok") setState({ kind: "result", certificate: result.data });
      else if (result.kind === "not_found") setState({ kind: "not_found" });
      else setState({ kind: "error" });
    }).catch(() => {
      if (active) setState({ kind: "error" });
    });
    return () => { active = false; };
  }, [verificationHash]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10" aria-labelledby="verify-certificate-heading">
      <h1 id="verify-certificate-heading" className="text-2xl font-bold text-text-primary">Certificate verification</h1>
      <p className="mt-1 text-sm text-text-secondary">This page is read-only and displays only the existing public verification response.</p>

      {state.kind === "loading" ? <p className="mt-6 text-sm text-text-secondary" role="status">Checking the public verification record…</p> : null}
      {state.kind === "invalid" ? <p className="mt-6 text-sm text-text-secondary" data-testid="verify-invalid-link" role="status">The verification link is invalid. No certificate status can be confirmed.</p> : null}
      {state.kind === "not_found" ? <p className="mt-6 text-sm text-text-secondary" data-testid="verify-not-found-state" role="status">No public verification record was found. This is not a confirmation of validity.</p> : null}
      {state.kind === "error" ? <p className="mt-6 text-sm text-text-secondary" role="alert">The verification record could not be confirmed. Please try again later.</p> : null}
      {state.kind === "result" ? (
        <section className="mt-6 rounded-xl border border-border/50 p-5" data-testid="verify-result-panel" aria-labelledby="verify-status-label">
          <h2 id="verify-status-label" className="text-lg font-semibold text-text-primary">Status: {statusLabel(state.certificate)}</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-text-muted">Holder</dt><dd className="font-medium text-text-primary">{state.certificate.fullName}</dd></div>
            <div><dt className="text-text-muted">Credential type</dt><dd className="font-medium text-text-primary">{state.certificate.credentialTypeLabel ?? state.certificate.certificateKind ?? "Not published"}</dd></div>
            <div><dt className="text-text-muted">Course</dt><dd className="font-medium text-text-primary">{state.certificate.courseName ?? "Not published"}</dd></div>
            <div><dt className="text-text-muted">Issued</dt><dd className="font-medium text-text-primary">{displayDate(state.certificate.issueDate)}</dd></div>
            <div><dt className="text-text-muted">Expires</dt><dd className="font-medium text-text-primary">{displayDate(state.certificate.expiryDate)}</dd></div>
          </dl>
        </section>
      ) : null}
      <p className="mt-6 text-sm"><Link className="text-brand underline" to="/verify">Verify another certificate</Link></p>
    </main>
  );
}

function PersonnelVerification({ certificateNumber }: { readonly certificateNumber: string }): JSX.Element {
  const [state, setState] = useState<PersonnelState>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    setState({ kind: "loading" });
    void fetchPublicPersonnelCertificate(certificateNumber).then((result) => {
      if (!active) return;
      if (result.kind === "ok") setState({ kind: "result", certificate: result.data });
      else setState({ kind: result.kind });
    }).catch(() => {
      if (active) setState({ kind: "error" });
    });
    return () => { active = false; };
  }, [certificateNumber]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10" data-testid="personnel-verify-page" aria-labelledby="personnel-verify-heading">
      <h1 id="personnel-verify-heading" className="text-2xl font-bold text-text-primary">Provjera certifikata osoblja</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Javna provjera bez prijave. Prikazani su samo ime, šema, status i datumi. Ovo nije potvrda o pohađanju kursa.
      </p>
      {state.kind === "loading" ? <p className="mt-6 text-sm text-text-secondary" role="status">Provjera zapisa…</p> : null}
      {state.kind === "not_found" ? <p className="mt-6 text-sm text-text-secondary" role="status">Certifikat s ovim brojem nije pronađen.</p> : null}
      {state.kind === "rate_limited" ? <p className="mt-6 text-sm text-text-secondary" role="status">Previše zahtjeva. Pokušajte ponovo za koji trenutak.</p> : null}
      {state.kind === "error" ? <p className="mt-6 text-sm text-text-secondary" role="alert">Provjera trenutno nije dostupna.</p> : null}
      {state.kind === "result" ? (
        <section className="mt-6 rounded-xl border border-border/50 p-5" data-testid="personnel-verify-result" aria-labelledby="personnel-status-label">
          <h2 id="personnel-status-label" className="text-lg font-semibold text-text-primary">
            Status: {personnelStatusLabel(state.certificate.status)}
          </h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-text-muted">Ime</dt><dd className="font-medium text-text-primary">{state.certificate.holderName ?? "—"}</dd></div>
            <div><dt className="text-text-muted">Šema</dt><dd className="font-medium text-text-primary">{state.certificate.scheme}</dd></div>
            <div><dt className="text-text-muted">Verzija</dt><dd className="font-medium text-text-primary">{state.certificate.schemeVersion}</dd></div>
            <div><dt className="text-text-muted">Broj</dt><dd className="font-mono font-medium text-text-primary">{state.certificate.certificateNumber}</dd></div>
            <div><dt className="text-text-muted">Izdato</dt><dd className="font-medium text-text-primary">{formatPersonnelDate(state.certificate.issuedAt)}</dd></div>
            <div><dt className="text-text-muted">Ističe</dt><dd className="font-medium text-text-primary">{formatPersonnelDate(state.certificate.expiresAt)}</dd></div>
          </dl>
        </section>
      ) : null}
      <p className="mt-6 text-sm">
        <Link className="text-brand underline" to="/registry">Javni registar</Link>
      </p>
    </main>
  );
}

function DocumentVerification({ number }: { readonly number: string }): JSX.Element {
  const [state, setState] = useState<
    | { readonly kind: "loading" }
    | { readonly kind: "not_found" }
    | { readonly kind: "rate_limited" }
    | { readonly kind: "error" }
    | { readonly kind: "result"; readonly document: PublicCaseDocument }
  >({ kind: "loading" });

  useEffect(() => {
    let active = true;
    setState({ kind: "loading" });
    void fetchPublicCaseDocument(number).then((result) => {
      if (!active) return;
      if (result.kind === "ok") setState({ kind: "result", document: result.data });
      else setState({ kind: result.kind });
    }).catch(() => {
      if (active) setState({ kind: "error" });
    });
    return () => { active = false; };
  }, [number]);

  const title = state.kind === "result" && state.document.kind === "EDUCATION"
    ? "Provjera potvrde o završetku edukacije"
    : "Provjera potvrde o rezultatu ispita";

  return (
    <main className="mx-auto max-w-2xl px-4 py-10" data-testid="document-verify-page" aria-labelledby="document-verify-heading">
      <h1 id="document-verify-heading" className="text-2xl font-bold text-text-primary">{title}</h1>
      <p className="mt-1 text-sm text-text-secondary">Ovo nije profesionalni certifikat.</p>
      {state.kind === "loading" ? <p className="mt-6 text-sm" role="status">Provjera zapisa…</p> : null}
      {state.kind === "not_found" ? <p className="mt-6 text-sm" role="status">Dokument s ovim brojem nije pronađen.</p> : null}
      {state.kind === "rate_limited" ? <p className="mt-6 text-sm" role="status">Previše zahtjeva. Pokušajte ponovo za koji trenutak.</p> : null}
      {state.kind === "error" ? <p className="mt-6 text-sm" role="alert">Provjera trenutno nije dostupna.</p> : null}
      {state.kind === "result" ? (
        <section className="mt-6 rounded-xl border border-border/50 p-5" data-testid="document-verify-result">
          <p className="text-sm text-text-primary">{state.document.statement}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-text-muted">Broj</dt><dd className="font-mono font-medium">{state.document.number}</dd></div>
            <div><dt className="text-text-muted">Naziv</dt><dd className="font-medium">{state.document.title}</dd></div>
            <div><dt className="text-text-muted">Ime</dt><dd className="font-medium">{state.document.holderName ?? "—"}</dd></div>
            <div><dt className="text-text-muted">Datum</dt><dd className="font-medium">{formatPersonnelDate(state.document.issuedAt)}</dd></div>
            {state.document.kind === "EXAM_PASS" ? (
              <div><dt className="text-text-muted">Rezultat</dt><dd className="font-medium">{state.document.passed ? "Položio" : "Nije položio"}</dd></div>
            ) : null}
          </dl>
        </section>
      ) : null}
    </main>
  );
}

/** Hash links keep the existing verification page. Personnel numbers use the public registry record. */
export default function VerifyCertificate(): JSX.Element {
  const { verificationHash } = useParams();
  if (verificationHash && isPersonnelCertificateNumber(verificationHash)) {
    return <PersonnelVerification certificateNumber={verificationHash.trim().toUpperCase()} />;
  }
  if (verificationHash && isEducationOrExamNumber(verificationHash)) {
    return <DocumentVerification number={verificationHash.trim().toUpperCase()} />;
  }
  return <HashVerification verificationHash={verificationHash} />;
}
