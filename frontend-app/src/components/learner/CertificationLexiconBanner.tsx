import { AlertTriangle, GraduationCap, Shield } from "lucide-react";
import { type JSX } from "react";

import { cn } from "@/lib/utils";

/**
 * Jasno razdvaja: završetak obuke / potvrda o polaganju vs. certifikacija po ISO 17024.
 */
export function CertificationLexiconBanner({
  className,
  variant = "default",
}: {
  readonly className?: string;
  readonly variant?: "default" | "compact";
}): JSX.Element {
  return (
    <div
      className={cn(
        "rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-surface-secondary/40 to-transparent p-4 text-left ring-1 ring-white/[0.04]",
        variant === "compact" && "p-3",
        className,
      )}
      role="region"
      aria-label="Razlika između obuke i certifikacije"
    >
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400/90" aria-hidden />
        <div className="min-w-0 space-y-3 text-sm leading-relaxed text-text-secondary">
          <p className="font-medium text-text-primary">
            Kupnja ili završetak tečaja{" "}
            <span className="text-amber-200/95">ne jamči profesionalnu certifikaciju</span> po shemi.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="flex gap-2 rounded-xl border border-border/40 bg-surface-primary/30 p-3">
              <GraduationCap className="h-5 w-5 shrink-0 text-sky-400/90" aria-hidden />
              <span>
                <span className="font-semibold text-text-primary">Potvrda o položenom ispitu</span> (automatski nakon
                prolaska) dokazuje edukativno-ispitni dio — to nije certifikat o certifikaciji osobe niti odluka odbora.
              </span>
            </li>
            <li className="flex gap-2 rounded-xl border border-border/40 bg-surface-primary/30 p-3">
              <Shield className="h-5 w-5 shrink-0 text-brand" aria-hidden />
              <span>
                <span className="font-semibold text-text-primary">Certifikacija (ISO/IEC 17024)</span> slijedi zaseban
                postupak prijave, provjere ispunjenosti sheme i odluke odbora. Status pratite u &quot;Status
                certifikacije&quot;.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
