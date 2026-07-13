import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command } from "@/components/ui/command";
import { X } from "lucide-react";
import { type JSX, type KeyboardEvent, useCallback, useEffect, useId, useMemo, useRef } from "react";

import { cn } from "@/lib/utils";

import type { CommandEntity } from "./command-entity-types";
import { stableCommandValue } from "./command-navigation";
import { CommandAiSuggestions } from "./CommandAiSuggestions";
import { CommandKeyboardHints } from "./CommandKeyboardHints";
import { CommandResultList } from "./CommandResultList";
import { CommandSearchInput } from "./CommandSearchInput";
import type { CommandGroupModel } from "./command-search-engine";

export type CommandCenterDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly search: string;
  readonly onSearchChange: (q: string) => void;
  readonly groups: readonly CommandGroupModel[];
  readonly onSelect: (entity: CommandEntity, opts: { readonly newTab: boolean }) => void;
  readonly onTogglePin?: (entity: CommandEntity) => void;
  readonly isPinned: (entity: CommandEntity) => boolean;
};

export function CommandCenterDialog({
  open,
  onOpenChange,
  search,
  onSearchChange,
  groups,
  onSelect,
  onTogglePin,
  isPinned,
}: CommandCenterDialogProps): JSX.Element {
  const listId = useId();
  const hintId = "command-center-search-hint";
  const inputRef = useRef<HTMLInputElement>(null);

  const entityByValue = useMemo(() => {
    const m = new Map<string, CommandEntity>();
    for (const g of groups) {
      for (const e of g.entities) {
        m.set(stableCommandValue(e), e);
      }
    }
    return m;
  }, [groups]);

  const handleShiftEnter = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Enter" || !e.shiftKey) return;
      e.preventDefault();
      const root = e.currentTarget;
      const selected =
        root.querySelector('[cmdk-item][data-selected="true"]') ?? root.querySelector('[cmdk-item][aria-selected="true"]');
      const raw =
        selected?.getAttribute("data-value") ?? selected?.getAttribute("value") ?? "";
      const ent = entityByValue.get(raw);
      if (ent) {
        onSelect(ent, { newTab: true });
      }
    },
    [entityByValue, onSelect],
  );

  useEffect(() => {
    if (!open) return;
    const fn = (e: globalThis.KeyboardEvent): void => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (inputRef.current && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current.focus();
      }
    };
    window.addEventListener("keydown", fn, true);
    return () => window.removeEventListener("keydown", fn, true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-[100] bg-black/55 backdrop-blur-xl transition-opacity",
            "data-[state=closed]:opacity-0 data-[state=open]:opacity-100 motion-reduce:transition-none",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-[101] w-[min(100vw-1.5rem,720px)] translate-x-[-50%] translate-y-[-50%]",
            "overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220]/95 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85)] ring-1 ring-sky-500/10",
            "outline-none motion-reduce:transition-none",
          )}
          aria-describedby={undefined}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogPrimitive.Title className="sr-only">Globalni command center — CONFORA</DialogPrimitive.Title>
          <Command
            shouldFilter={false}
            className="flex flex-col text-[#F8FAFC]"
            onKeyDown={handleShiftEnter}
            aria-controls={listId}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Command</span>
              <DialogPrimitive.Close
                type="button"
                className="rounded-lg p-1 text-[#94A3B8] hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
                aria-label="Zatvori"
              >
                <X className="h-4 w-4" aria-hidden />
              </DialogPrimitive.Close>
            </div>
            <CommandAiSuggestions onSelectQuery={(q) => onSearchChange(q)} />
            <p id={hintId} className="sr-only">
              Pretražuj rute, entitete i brze akcije. Tipke kao u listi s prečacima cert: risk: course:.
            </p>
            <CommandSearchInput
              ref={inputRef}
              placeholder="Pretraži sve (rute, certifikacija, governance…)"
              value={search}
              onValueChange={onSearchChange}
              autoComplete="off"
            />
            <CommandResultList
              groups={groups}
              onSelect={onSelect}
              isPinned={isPinned}
              listboxId={listId}
              {...(onTogglePin ? { onTogglePin } : {})}
            />
            <CommandKeyboardHints />
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
