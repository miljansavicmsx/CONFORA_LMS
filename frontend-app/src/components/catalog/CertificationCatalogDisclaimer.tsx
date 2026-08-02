import type { JSX } from "react";

type Props = {
  readonly compact?: boolean;
  readonly testId?: string;
};

/**
 * D-12 — Public catalogue must not imply education enrolment/completion/exam pass grants ISO/IEC 17024 certification.
 */
export function CertificationCatalogDisclaimer({
  compact = false,
  testId = "catalog-cert-disclaimer",
}: Props): JSX.Element {
  return (
    <aside
      data-testid={testId}
      role="note"
      className={
        compact
          ? "rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-text-secondary"
          : "rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-text-secondary"
      }
    >
      <p className="font-medium text-text-primary">Obavijest o certifikaciji osoba (ISO/IEC 17024)</p>
      <p className="mt-1">
        Javni katalog prikazuje <strong>edukacijske programe</strong> i javne informacije o certifikacijskim
        shemama. Upis na program, završetak edukacije ili prolazak ispita{" "}
        <strong>ne daje automatski</strong> certifikat osobe prema ISO/IEC 17024.
      </p>
      {!compact ? (
        <p className="mt-2">
          Certifikacija zahtijeva zaseban postupak: prijava, provjeru podobnosti i dokaza, odluku ovlaštenog
          certifikacijskog tijela te izdavanje i aktivaciju certifikata u registru.
        </p>
      ) : null}
    </aside>
  );
}
