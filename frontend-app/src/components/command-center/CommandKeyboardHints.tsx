import type { JSX } from "react";

import { cn } from "@/lib/utils";

type CommandKeyboardHintsProps = {
  readonly className?: string;
};

export function CommandKeyboardHints({ className }: CommandKeyboardHintsProps): JSX.Element {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08] px-3 py-2 text-[10px] text-[#64748B]",
        className,
      )}
    >
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        <span>
          <Kbd>Esc</Kbd> zatvori
        </span>
        <span>
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> navigacija
        </span>
        <span>
          <Kbd>Enter</Kbd> otvori
        </span>
        <span>
          <Kbd>Shift</Kbd>+<Kbd>Enter</Kbd> novi tab
        </span>
        <span>
          <Kbd>/</Kbd> fokus polja
        </span>
      </div>
      <span className="hidden sm:inline">Tab unutar dijaloga slijedi redoslijed fokusa</span>
    </div>
  );
}

function Kbd({ children }: { readonly children: string }): JSX.Element {
  return (
    <kbd className="rounded border border-white/10 bg-black/30 px-1 py-0.5 font-mono text-[9px] text-[#94A3B8]">{children}</kbd>
  );
}
