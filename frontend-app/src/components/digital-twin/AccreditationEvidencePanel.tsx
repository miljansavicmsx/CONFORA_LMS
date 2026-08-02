import { type JSX, useMemo } from "react";

import type { AccreditationPillar } from "@/lib/digital-twin";

export function AccreditationEvidencePanel({
  pillars,
  documentCount,
}: {
  readonly pillars: readonly AccreditationPillar[];
  readonly documentCount: number;
}): JSX.Element {
  const doc = pillars.find((p) => p.id === "governance-docs");
  const audit = pillars.find((p) => p.id === "audit");
  const trace = pillars.find((p) => p.id === "traceability");

  const lines = useMemo(
    () => [
      `Registrirani governance dokumenti (broj iz CB API): ${documentCount}.`,
      doc ? `Dokumentacijski stub: ${doc.detail}` : null,
      audit ? `Audit stub: ${audit.detail}` : null,
      trace ? `Traceability stub: ${trace.detail}` : null,
    ],
    [audit, doc, documentCount, trace],
  );

  return (
    <section
      aria-label="Evidentni lanac za akreditaciju"
      className="rounded-2xl border border-border/45 bg-surface-secondary/40 p-5"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Accreditation evidence chain</p>
      <ul className="mt-3 list-inside list-disc space-y-2 text-xs text-text-secondary">
        {lines.filter(Boolean).map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] text-text-muted">
        Tekstualni dokazni lanac za WCAG — grafovi nisu jedini izvor istine.
      </p>
    </section>
  );
}
