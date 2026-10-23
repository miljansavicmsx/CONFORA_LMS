import { useEffect, useState, type JSX } from "react";
import { Link, useParams } from "react-router";

import { fetchPublicCaseDocument, type PublicVerificationView } from "@/lib/case-public";
import { getConforaApiConfig, joinBaseUrlAndPath } from "@/lib/api/api-config";
import { fetchPublicPersonnelCertificate, personnelStatusLabel } from "@/lib/personnel-public";

type VerifyState =
  | { readonly kind: "loading" }
  | { readonly kind: "rate_limited" }
  | { readonly kind: "error" }
  | { readonly kind: "unverified" }
  | { readonly kind: "result"; readonly source: "document" | "certificate"; readonly view: PublicVerificationView };

function isHidden(view: PublicVerificationView): boolean {
  return view.status === "INVALID" && !view.documentType;
}

function documentTypeLabel(value: string | null): string {
  if (value === "EDUCATION_COMPLETION") return "Potvrda o završetku edukacije";
  if (value === "EXAM_PASS") return "Potvrda o ispitu";
  if (value === "PERSONNEL_CERTIFICATE") return "Certifikat osoblja";
  return "Nije objavljeno";
}

function pdfHref(source: "document" | "certificate", key: string): string {
  const path = source === "document"
    ? `/v1/public/documents/${encodeURIComponent(key)}/pdf`
    : `/v1/public/certificates/${encodeURIComponent(key)}/pdf`;
  return joinBaseUrlAndPath(getConforaApiConfig().nestBaseUrl, path);
}

function PublicTokenVerification({ verificationKey }: { readonly verificationKey: string }): JSX.Element {
  const [state, setState] = useState<VerifyState>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    setState({ kind: "loading" });
    void (async () => {
      const document = await fetchPublicCaseDocument(verificationKey);
      if (!active) return;
      if (document.kind === "rate_limited") {
        setState({ kind: "rate_limited" });
        return;
      }
      if (document.kind === "ok" && !isHidden(document.data)) {
        setState({ kind: "result", source: "document", view: document.data });
        return;
      }
      if (document.kind === "error") {
        setState({ kind: "error" });
        return;
      }
      const certificate = await fetchPublicPersonnelCertificate(verificationKey);
      if (!active) return;
      if (certificate.kind === "rate_limited") {
        setState({ kind: "rate_limited" });
        return;
      }
      if (certificate.kind === "ok" && !isHidden(certificate.data)) {
        setState({ kind: "result", source: "certificate", view: certificate.data });
        return;
      }
      if (certificate.kind === "error") {
        setState({ kind: "error" });
        return;
      }
      setState({ kind: "unverified" });
    })().catch(() => {
      if (active) setState({ kind: "error" });
    });
    return () => { active = false; };
  }, [verificationKey]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10" data-testid="public-verify-page" aria-labelledby="public-verify-heading">
      <h1 id="public-verify-heading" className="text-2xl font-bold text-text-primary">Javna provjera</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Prikazuju se status, vrsta i datum. Ime samo uz pristanak. Rezultat ispita se ne objavljuje.
      </p>
      {state.kind === "loading" ? <p className="mt-6 text-sm" role="status">Provjera zapisa…</p> : null}
      {state.kind === "unverified" ? <p className="mt-6 text-sm" data-testid="verify-unconfirmed" role="status">Provjera nije potvrdila dokument.</p> : null}
      {state.kind === "rate_limited" ? <p className="mt-6 text-sm" role="status">Previše zahtjeva. Pokušajte ponovo za koji trenutak.</p> : null}
      {state.kind === "error" ? <p className="mt-6 text-sm" role="alert">Provjera trenutno nije dostupna.</p> : null}
      {state.kind === "result" ? (
        <section className="mt-6 rounded-xl border border-border/50 p-5" data-testid="public-verify-result">
          <h2 className="text-lg font-semibold text-text-primary">Status: {personnelStatusLabel(state.view.status)}</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-text-muted">Vrsta</dt><dd className="font-medium">{documentTypeLabel(state.view.documentType)}</dd></div>
            <div><dt className="text-text-muted">Datum izdavanja</dt><dd className="font-medium">{state.view.issuedAt ?? "—"}</dd></div>
            <div><dt className="text-text-muted">Ime</dt><dd className="font-medium">{state.view.holderName ?? "Ime nije objavljeno"}</dd></div>
          </dl>
          <p className="mt-4 text-sm">
            <a className="text-brand underline" href={pdfHref(state.source, verificationKey)}>Preuzmi javni PDF</a>
          </p>
        </section>
      ) : null}
      <p className="mt-6 text-sm">
        <Link className="text-brand underline" to="/registry">Nova provjera</Link>
      </p>
    </main>
  );
}

/** Every key uses the OD-PP-30 public document and certificate views. */
export default function VerifyCertificate(): JSX.Element {
  const { verificationHash } = useParams();
  const key = typeof verificationHash === "string" ? verificationHash.trim() : "";
  return <PublicTokenVerification verificationKey={key} />;
}
