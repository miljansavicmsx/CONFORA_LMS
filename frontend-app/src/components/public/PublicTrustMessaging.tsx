import { Shield, ShieldCheck } from "lucide-react";
import type { JSX } from "react";

type Variant = "catalogue" | "verification" | "compact";

type Props = {
  readonly variant?: Variant;
  readonly testId?: string;
};

/**
 * PUBLIC-UX-1 — Concise trust messaging without overclaiming accreditation or production readiness.
 */
export function PublicTrustMessaging({
  variant = "catalogue",
  testId = "public-trust-messaging",
}: Props): JSX.Element {
  if (variant === "compact") {
    return (
      <p
        data-testid={testId}
        className="text-xs leading-relaxed text-text-muted"
      >
        Javni prikaz je informativan. Certifikacija zahtijeva zaseban postupak odluke i izdavanja.
        Javna verifikacija je samo za čitanje.
      </p>
    );
  }

  const isVerify = variant === "verification";
  const Icon = isVerify ? ShieldCheck : Shield;

  return (
    <aside
      data-testid={testId}
      role="note"
      className="rounded-xl border border-border/50 bg-surface-secondary/30 px-4 py-3 text-sm leading-relaxed text-text-secondary"
    >
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
        <div className="space-y-2">
          <p className="font-medium text-text-primary">
            {isVerify ? "O javnoj verifikaciji" : "O CONFORA javnom prikazu"}
          </p>
          <ul className="list-inside list-disc space-y-1 text-xs sm:text-sm">
            <li>
              CONFORA podržava edukacijske programe i kontrolirane certifikacijske tijekove — odvojeno
              od javnog kataloga.
            </li>
            <li>
              Certifikacija osobe zahtijeva zaseban postupak: prijava, provjera dokaza, odluku tijela,
              izdavanje i životni ciklus u registru.
            </li>
            <li>Javna verifikacija potvrđuje <strong>samo status u registru</strong> — bez pristupa privatnim dosjeima.</li>
            <li>Ručna provjera identiteta u pilotu je <strong>bez biometrije</strong>; interni izvještaji i audit nisu javni.</li>
          </ul>
          <p className="text-[11px] text-text-muted">
            Ovo nije tvrdnja o akreditaciji, produkcijskoj spremnosti ili pravnom odobrenju platforme.
          </p>
        </div>
      </div>
    </aside>
  );
}
