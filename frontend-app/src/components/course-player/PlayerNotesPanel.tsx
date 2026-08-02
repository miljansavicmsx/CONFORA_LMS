"use client";

import { Sparkles } from "lucide-react";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { useAiTutorPlayerStore } from "@/store/aiTutorPlayerStore";
import { cn } from "@/lib/utils";

export function PlayerNotesPanel({
  className,
  hideAiTrigger = false,
}: {
  readonly className?: string;
  /** Kad je AI već u desnom stupcu player-a, sakrij dupli gumb. */
  readonly hideAiTrigger?: boolean;
}): JSX.Element {
  const openPanel = useAiTutorPlayerStore((s) => s.openPanel);
  const isTyping = useAiTutorPlayerStore((s) => s.isTyping);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-l border-border/20 bg-surface-primary",
        className,
      )}
      aria-label={hideAiTrigger ? "Bilješke uz lekciju" : "Bilješke i AI tutor"}
    >
      {!hideAiTrigger ? (
        <div className="border-b border-border/20 p-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-2 border-violet-500/40 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20 hover:text-white"
            onClick={() => openPanel()}
          >
            <Sparkles
              className={cn("h-4 w-4 shrink-0 text-violet-400", isTyping && "animate-pulse")}
              aria-hidden
            />
            Otvori AI Tutor
          </Button>
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-3">
        <label htmlFor="player-notes" className="text-xs font-medium uppercase tracking-wide text-text-muted">
          Bilješke
        </label>
        <textarea
          id="player-notes"
          rows={12}
          placeholder="Tvoje bilješke uz lekciju…"
          className="mt-2 flex-1 resize-none rounded-lg border border-border/40 bg-surface-secondary/60 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        />
      </div>
    </aside>
  );
}
