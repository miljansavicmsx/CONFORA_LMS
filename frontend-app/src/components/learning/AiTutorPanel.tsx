import { MessageCircle, Sparkles } from "lucide-react";
import { useCallback, type JSX } from "react";

import { Button } from "@/components/ui/button";
import { EnterpriseAiBadge } from "@/design-system";
import { useAiTutorPlayerStore } from "@/store/aiTutorPlayerStore";

const PRESETS = [
  { label: "Pitaj o ovoj lekciji", text: "Ukratko objasni glavne pojmove ove lekcije i kako se povezuju s nastavkom programa." },
  { label: "Objasni jednostavnije", text: "Objasni ovu lekciju jednostavnim jezikom, kao polazniku koji prvi put vidi temu." },
  { label: "Pitanja za ponavljanje", text: "Generiši 5 kratkih pitanja za samoprovjeru iz ove lekcije (bez otkrivanja točnih odgovora u jednoj rečenici)." },
] as const;

export function AiTutorPanel({ className }: { readonly className?: string }): JSX.Element {
  const openPanel = useAiTutorPlayerStore((s) => s.openPanel);
  const sendMessage = useAiTutorPlayerStore((s) => s.sendMessage);
  const togglePanel = useAiTutorPlayerStore((s) => s.togglePanel);

  const onPreset = useCallback(
    (text: string) => {
      openPanel();
      void sendMessage(text);
    },
    [openPanel, sendMessage],
  );

  return (
    <aside className={className} aria-label="AI tutor za lekciju">
      <div className="rounded-xl border border-violet-500/30 bg-surface-secondary/90 p-4 shadow-lg ring-1 ring-violet-500/15">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-300" aria-hidden />
          <h2 className="text-sm font-semibold text-text-primary">AI tutor</h2>
          <EnterpriseAiBadge humanApprovalRequired>Označeno kao AI</EnterpriseAiBadge>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          Asistent daje prijedloge učenja. Kritične odluke i službena provjera i dalje su na čovjeku i u postojećim tijekovima.
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {PRESETS.map((p) => (
            <li key={p.label}>
              <Button
                type="button"
                variant="outline"
                className="h-auto w-full justify-start whitespace-normal border-violet-500/30 py-2 text-left text-xs text-text-primary hover:bg-violet-500/10"
                onClick={() => onPreset(p.text)}
              >
                <MessageCircle className="mr-2 h-4 w-4 shrink-0 text-violet-300" aria-hidden />
                {p.label}
              </Button>
            </li>
          ))}
        </ul>
        <Button type="button" variant="ghost" size="sm" className="mt-2 w-full text-text-muted" onClick={() => togglePanel()}>
          Otvori / zatvori prozor chata
        </Button>
      </div>
    </aside>
  );
}
