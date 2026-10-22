import { useState, type JSX } from "react";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { PublicTrustMessaging } from "@/components/public/PublicTrustMessaging";
import { EntityLineagePanel } from "@/components/entity-relations";
import { EntityKind, buildTrustNavigationExplainerEdges } from "@/lib/entity-relationships";

export default function VerifyLookupPage(): JSX.Element {
  const [reference, setReference] = useState("");
  const nav = useNavigate();

  const onVerify = (): void => {
    const ref = reference.trim();
    if (!ref) return;
    nav(`/verify/${encodeURIComponent(ref)}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-text-primary" data-testid="verify-lookup-heading">
        Javna verifikacija
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Unesite kriptografski identifikator provjere. Uzastopni broj zapisa nije javni ključ.
      </p>
      <div className="mt-4">
        <PublicTrustMessaging variant="verification" />
      </div>
      <p className="mt-2 text-xs text-text-muted">Javna provjera je samo za čitanje — bez izmjene statusa certifikata.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="verify-lookup-input">
          Referenca ili verification hash
        </label>
        <input
          id="verify-lookup-input"
          data-testid="verify-lookup-input"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Identifikator provjere"
          className="h-10 min-w-0 flex-1 rounded-md border border-border/60 bg-surface-primary px-3 text-sm font-mono"
        />
        <Button type="button" onClick={onVerify} disabled={!reference.trim()}>
          Otvori / provjeri
        </Button>
      </div>
      <p className="mt-2 text-xs text-text-muted">
        <Link className="text-brand underline" to="/registry">
          Javni registar
        </Link>
        . Prijava nije potrebna.
      </p>

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
