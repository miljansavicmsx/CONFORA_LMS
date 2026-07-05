import { useState, type JSX } from "react";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { PublicTrustMessaging } from "@/components/public/PublicTrustMessaging";
import { EntityLineagePanel } from "@/components/entity-relations";
import { verifyPublicCertificateByReference } from "@/lib/api";
import { EntityKind, buildTrustNavigationExplainerEdges } from "@/lib/entity-relationships";
import { isNormalizedApiError } from "@/lib/api";

type PublicVerify = {
  readonly valid: boolean;
  readonly verificationResult?: string;
  readonly certificateKind?: string;
};

function looksLikeHexHash64(s: string): boolean {
  const t = s.trim();
  if (t.length !== 64) {
    return false;
  }
  return /^[0-9a-fA-F]{64}$/.test(t);
}

export default function VerifyLookupPage(): JSX.Element {
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<PublicVerify | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const onVerify = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    setResult(null);
    const ref = reference.trim();
    if (looksLikeHexHash64(ref)) {
      nav(`/verify/${encodeURIComponent(ref)}`);
      setBusy(false);
      return;
    }
    try {
      const result = await verifyPublicCertificateByReference(ref);
      if (result.kind === "ok") {
        setResult(result.data);
      } else if (result.kind === "not_found") {
        setError("NOT_FOUND, RESTRICTED ili mrežna greška. Za kanonski demo koristi 64-hex hash u /verify/{hash}.");
      } else {
        setError(
          isNormalizedApiError(result.normalized)
            ? result.normalized.message
            : "NOT_FOUND, RESTRICTED ili mrežna greška. Za kanonski demo koristi 64-hex hash u /verify/{hash}.",
        );
      }
    } catch {
      setError("NOT_FOUND, RESTRICTED ili mrežna greška. Za kanonski demo koristi 64-hex hash u /verify/{hash}.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-text-primary" data-testid="verify-lookup-heading">
        Javna verifikacija
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Unesi puni <strong>verification hash</strong> (64 hex) i otvorit će se ista stranica kao u demo materijalima, ili
        unesi referencu za <code className="text-xs">POST /api/public/certificates/verify</code>.
      </p>
      <div className="mt-4">
        <PublicTrustMessaging variant="verification" />
      </div>
      <p className="mt-2 text-xs text-text-muted">Javna provjera je samo za čitanje — bez izmjene statusa certifikata.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <input
          data-testid="verify-lookup-input"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Npr. 64-hex hash iz potvrde"
          className="h-10 min-w-0 flex-1 rounded-md border border-border/60 bg-surface-primary px-3 text-sm font-mono"
        />
        <Button type="button" onClick={() => void onVerify()} disabled={busy || !reference.trim()}>
          {busy ? "…" : "Otvori / provjeri"}
        </Button>
      </div>
      <p className="mt-2 text-xs text-text-muted">
        <Link className="text-brand underline" to="/login">
          Prijava
        </Link>{" "}
        nije potrebna za javni pregled.
      </p>

      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

      {result ? (
        <div className="mt-6 rounded-xl border border-border/50 p-4">
          <p className="text-sm text-text-secondary">valid: {String(result.valid)}</p>
          <p className="text-sm text-text-secondary">verificationResult: {result.verificationResult ?? "—"}</p>
          <p className="text-sm text-text-secondary">kind: {result.certificateKind ?? "—"}</p>
        </div>
      ) : null}

      <div className="mt-10 rounded-2xl border border-border/45 bg-surface-secondary/25 p-4 ring-1 ring-white/[0.04]">
        <h2 className="text-sm font-semibold text-text-primary">Kako trust linija izgleda u CONFORA</h2>
        <p className="mt-1 text-xs text-text-secondary">
          Ilustrativni graf bez poziva prema backendu — spaja EXAM_PASS, PERSON_CERTIFICATION i javni hash.
        </p>
        <div className="mt-4">
          <EntityLineagePanel
            centerId="learner"
            centerType={EntityKind.PROCESS}
            centerLabel="Javna provjera (ilustracija)"
            edges={buildTrustNavigationExplainerEdges()}
            maxGraphNodes={7}
          />
        </div>
      </div>
    </div>
  );
}
