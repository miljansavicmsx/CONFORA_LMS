import { useCallback, useEffect, useMemo, useRef, useState, type JSX, type KeyboardEvent } from "react";

import { EnterpriseDataTable, EnterpriseEmptyState } from "@/design-system";
import type { Severity } from "@/design-system/SeverityBadge";
import { explainRequirementCoverage } from "@/lib/knowledge/knowledge-explainability";
import type { CoverageBand, KnowledgeRequirement } from "@/lib/knowledge/knowledge-types";
import type { TwinNormalizedInput } from "@/lib/digital-twin/twin-types";
import { clauseById } from "@/lib/knowledge/registries";
import { ScrollText } from "lucide-react";

const WINDOW = 18;
/** Iznad praga ostaje paginacija prozora; virtualizacija je implicitna kroz mali broj redaka u DOM-u. */
export const REQUIREMENT_MATRIX_PAGE_THRESHOLD = 36;

function bandToSeverity(band: CoverageBand): Severity {
  switch (band) {
    case "strong":
      return "success";
    case "medium":
      return "info";
    case "weak":
      return "warning";
    case "unknown":
      return "warning";
    default:
      return "info";
  }
}

function bandStatusText(band: CoverageBand, confidence: number): string {
  const labels: Record<CoverageBand, string> = {
    strong: `Jaka heuristička pokrivenost (${confidence}% pouzdanosti)`,
    medium: `Umjerena pokrivenost — provjeriti uzorak dokaza (${confidence}%)`,
    weak: `Slaba pokrivenost — prioritet ljudske provjere (${confidence}%)`,
    unknown: `Nepoznata pokrivenost — nedostaje registry ili kontekst (${confidence}%)`,
  };
  return labels[band];
}

export function RequirementCoverageMatrix({
  requirements,
  snapshot,
}: {
  readonly requirements: readonly KnowledgeRequirement[];
  readonly snapshot: TwinNormalizedInput;
}): JSX.Element {
  const [offset, setOffset] = useState(0);
  const [rowFocus, setRowFocus] = useState(0);

  const slice = useMemo(() => requirements.slice(offset, offset + WINDOW), [requirements, offset]);
  const maxOff = Math.max(0, requirements.length - WINDOW);
  const usePaging = requirements.length >= REQUIREMENT_MATRIX_PAGE_THRESHOLD;

  const focusSyncReady = useRef(false);

  useEffect(() => {
    setRowFocus(0);
    focusSyncReady.current = false;
  }, [offset, slice.length]);

  useEffect(() => {
    if (!focusSyncReady.current) {
      focusSyncReady.current = true;
      return;
    }
    const id = slice[rowFocus]?.id;
    if (!id) return;
    const handle = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`tr[data-matrix-row="${id}"]`)?.focus();
    });
    return () => window.cancelAnimationFrame(handle);
  }, [rowFocus, slice]);

  const moveFocus = useCallback(
    (dir: -1 | 1) => {
      setRowFocus((i) => {
        const next = i + dir;
        if (next < 0 || next >= slice.length) return i;
        return next;
      });
    },
    [slice.length],
  );

  const rows = useMemo(() => {
    return slice.map((req, i) => {
      const cl = clauseById(req.clauseId);
      const ex = explainRequirementCoverage(req, cl, snapshot);
      const statusText = bandStatusText(ex.band, ex.confidence);
      return {
        id: req.id,
        severity: bandToSeverity(ex.band),
        cells: [
          <span key="c0" className="font-mono text-xs">
            {req.standardId}
          </span>,
          <span key="c1" className="line-clamp-2 text-text-secondary">
            {req.text}
          </span>,
          <span key="c2" className="text-sm text-text-primary">
            <span className="sr-only">Status: </span>
            {statusText}
          </span>,
        ],
        aiAssisted: true,
        workflowLabel: `${ex.confidence}%`,
        trProps: {
          tabIndex: i === rowFocus ? 0 : -1,
          onFocus: () => setRowFocus(i),
          onKeyDown: (e: KeyboardEvent<HTMLTableRowElement>) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              moveFocus(1);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              moveFocus(-1);
            }
          },
          "aria-label": `${req.standardId}. ${req.text.slice(0, 120)}. ${statusText}`,
          "data-matrix-row": req.id,
        },
      };
    });
  }, [slice, snapshot, rowFocus, moveFocus]);

  const summary = `Matrica zahtjeva: prikaz ${requirements.length === 0 ? 0 : offset + 1}–${Math.min(offset + WINDOW, requirements.length)} od ${requirements.length}. ${
    usePaging ? "Veliki skup — navigacija prozorima." : ""
  }`;

  if (requirements.length === 0) {
    return (
      <EnterpriseEmptyState
        icon={ScrollText}
        title="Nema zahtjeva u presjeku"
        description="Registry nije vratio atomic zahtjeve za ovaj prikaz."
      />
    );
  }

  return (
    <div className="space-y-3">
      <p id="knowledge-matrix-summary" className="text-sm text-text-secondary">
        {summary}
      </p>
      {usePaging ? (
        <p className="text-xs text-text-muted">
          Paginacija: prikazuje se najviše {WINDOW} redaka odjednom radi performansi i čitljivosti.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-border/50 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
          disabled={offset <= 0}
          onClick={() => setOffset((o) => Math.max(0, o - WINDOW))}
        >
          Prethodni prozor
        </button>
        <button
          type="button"
          className="rounded-lg border border-border/50 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
          disabled={offset >= maxOff}
          onClick={() => setOffset((o) => Math.min(maxOff, o + WINDOW))}
        >
          Sljedeći prozor
        </button>
      </div>
      <div aria-describedby="knowledge-matrix-summary">
        <EnterpriseDataTable
          ariaLabel="Matrica pokrivenosti zahtjeva standards intelligence"
          caption={summary}
          stickyHeader
          desktopScrollClassName="max-h-[min(60vh,28rem)] overflow-auto"
          columns={[
            { id: "std", header: "Standard" },
            { id: "req", header: "Zahtjev" },
            { id: "band", header: "Status (tekst + badge)" },
          ]}
          rows={rows}
        />
      </div>
      <p className="text-xs text-text-muted">
        Tipkovnica: fokusirajte red tabulatorom unutar tabele, zatim strelice gore/dolje za pomicanje fokusa po redovima.
      </p>
    </div>
  );
}
