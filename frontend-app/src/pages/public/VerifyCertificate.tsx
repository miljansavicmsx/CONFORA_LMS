import { useEffect, useState, type JSX } from "react";
import { Link, useParams } from "react-router";

import { verifyCertificate, type VerifiedCertificatePublic } from "@/lib/api-certificates";

type VerificationState =
  | { readonly kind: "loading" }
  | { readonly kind: "invalid" }
  | { readonly kind: "not_found" }
  | { readonly kind: "error" }
  | { readonly kind: "result"; readonly certificate: VerifiedCertificatePublic };

function isHash(value: string | undefined): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/iu.test(value);
}

function displayDate(value: string | null): string {
  return value?.trim() || "Not published";
}

function statusLabel(certificate: VerifiedCertificatePublic): string {
  return certificate.effectiveStatus ?? certificate.verificationResult ?? certificate.status;
}

/** Public, read-only display of the existing trusted verification response. */
export default function VerifyCertificate(): JSX.Element {
  const { verificationHash } = useParams();
  const [state, setState] = useState<VerificationState>(() => (isHash(verificationHash) ? { kind: "loading" } : { kind: "invalid" }));

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
