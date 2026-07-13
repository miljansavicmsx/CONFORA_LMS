import type { JSX } from "react";

import { EnterpriseAiBadge } from "@/design-system";
import { cn } from "@/lib/utils";

import { ds } from "@/design-system/tokens";

export type AiSuggestionChip = {
  readonly id: string;
  readonly label: string;
  readonly query: string;
  readonly hint?: string;
};

const DEFAULT_CHIPS: readonly AiSuggestionChip[] = [
  { id: "high-risk", label: "Visoki rizici", query: "high risks", hint: "Semantic · rizici" },
  { id: "expiring-cert", label: "Certifikati na isteku", query: "expiring certificates", hint: "Semantic · certifikacija" },
  { id: "pending-app", label: "Prijave na pregledu", query: "applications waiting review", hint: "Semantic · prijave" },
  { id: "iso", label: "ISO / 17024", query: "ISO 17024", hint: "Standardi" },
  { id: "ai-q", label: "AI pitanja", query: "AI generated questions", hint: "Item bank / roleplay" },
  { id: "pending-appr", label: "Pending odobrenja", query: "pending approvals", hint: "Odbori / odluke" },
  { id: "my-capa", label: "Moje CAPA", query: "capa:", hint: "Shortcut · capa:" },
  { id: "cert-short", label: "Certifikacija", query: "cert:", hint: "Shortcut · cert:" },
];

type CommandAiSuggestionsProps = {
  readonly chips?: readonly AiSuggestionChip[];
  readonly onSelectQuery: (query: string) => void;
  readonly className?: string;
};

export function CommandAiSuggestions({
  chips = DEFAULT_CHIPS,
  onSelectQuery,
  className,
}: CommandAiSuggestionsProps): JSX.Element {
  return (
    <div
      className={cn(
        "border-b border-white/[0.08] bg-gradient-to-r from-violet-500/[0.08] via-transparent to-sky-500/[0.06] px-3 py-2",
        className,
      )}
      role="region"
      aria-label="AI prijedlozi pretrage (bez poziva na LLM)"
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <EnterpriseAiBadge humanApprovalRequired={false}>Probaj tražiti…</EnterpriseAiBadge>
        <span className="text-[10px] text-[#94A3B8]">orchestracija na klijentu</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            className={cn(
              "rounded-full border border-violet-400/25 bg-violet-500/[0.08] px-2.5 py-1 text-[11px] font-medium text-[#E2E8F0] motion-safe:transition-colors",
              "hover:border-violet-400/45 hover:bg-violet-500/[0.14]",
              "motion-reduce:transition-none",
              ds.focusRingAi,
            )}
            onClick={() => onSelectQuery(c.query)}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
