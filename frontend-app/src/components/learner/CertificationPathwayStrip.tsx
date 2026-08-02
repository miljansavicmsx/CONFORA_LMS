import { GraduationCap, ShieldCheck } from "lucide-react";
import type { JSX } from "react";

export function CertificationPathwayStrip(): JSX.Element {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border-2 border-sky-400/35 bg-gradient-to-br from-sky-500/15 to-surface-secondary/80 p-4 shadow-sm ring-1 ring-sky-500/15">
        <div className="flex items-start gap-3">
          <GraduationCap className="mt-0.5 h-6 w-6 shrink-0 text-sky-300" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-text-primary">Položen ispit</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-sky-200/90">Potvrda o polaganju</p>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              Dokument koji potvrđuje uspjeh na ispitu programa. To nije certifikacija osobe po shemi — služi kao dokaz
              znanja iz edukacije.
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border-2 border-brand/45 bg-gradient-to-br from-brand/12 to-surface-secondary/80 p-4 shadow-md ring-1 ring-brand/25">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-brand" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-text-primary">Certifikacija osobe</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-brand/80">Formalni certifikat</p>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              Izdaje se tek nakon prijave, provjere usklađenosti i službene odluke certifikacijskog odbora prema shemi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
