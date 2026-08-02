import type { JSX } from "react";
import { Link } from "react-router";

/**
 * Clarifies education vs certification boundaries on public course detail (BR-01/02/03 + D-12).
 */
export function EducationCertificationBoundary({
  testId = "education-certification-boundary",
}: {
  readonly testId?: string;
}): JSX.Element {
  return (
    <section
      data-testid={testId}
      aria-labelledby="edu-cert-boundary-heading"
      className="rounded-xl border border-border/50 bg-surface-secondary/25 p-4 text-sm text-text-secondary"
    >
      <h2 id="edu-cert-boundary-heading" className="text-base font-semibold text-text-primary">
        Što ovaj program jest — a što nije
      </h2>
      <ul className="mt-3 space-y-2 text-xs leading-relaxed sm:text-sm">
        <li>
          <strong className="text-text-primary">Edukacijski program</strong> — sadržaj, moduli i
          praćenje napretka (nakon prijave).
        </li>
        <li>
          <strong className="text-text-primary">Ispit / procjena</strong> — ako je predviđen shemom,
          odvojen je od samog završetka edukacije.
        </li>
        <li>
          <strong className="text-text-primary">Prijava za certifikaciju</strong> — zaseban postupak
          nakon ispunjavanja uvjeta sheme; ne pokreće se automatski upisom na program.
        </li>
        <li>
          <strong className="text-text-primary">Potvrda o završetku edukacije</strong> — nije isto što
          i ISO/IEC 17024 certifikat osobe.
        </li>
        <li>
          <strong className="text-text-primary">ISO/IEC 17024 certifikat</strong> — izdaje se nakon
          odluke certifikacijskog tijela i evidentira u registru (
          <Link to="/verify" className="text-brand underline-offset-2 hover:underline">
            javna verifikacija
          </Link>
          ).
        </li>
      </ul>
    </section>
  );
}
