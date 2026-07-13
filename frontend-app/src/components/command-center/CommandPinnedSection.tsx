import type { JSX } from "react";

import { CommandItem } from "@/components/ui/command";

import type { CommandEntity } from "./command-entity-types";
import { stableCommandValue } from "./command-navigation";
import { CommandEntityRow } from "./CommandEntityRow";
import { CommandResultGroup } from "./CommandResultGroup";

type CommandPinnedSectionProps = {
  readonly entities: readonly CommandEntity[];
  readonly onSelect: (e: CommandEntity) => void;
  readonly onTogglePin?: (e: CommandEntity) => void;
  readonly isPinned: (e: CommandEntity) => boolean;
};

export function CommandPinnedSection({ entities, onSelect, onTogglePin, isPinned }: CommandPinnedSectionProps): JSX.Element | null {
  if (entities.length === 0) return null;
  return (
    <CommandResultGroup heading="Prikvačeno">
      {entities.map((entity) => {
        const val = stableCommandValue(entity);
        return (
          <CommandItem
            key={val}
            value={val}
            onSelect={() => onSelect(entity)}
            className="items-start rounded-xl border border-transparent px-2 py-2 data-[selected=true]:border-sky-500/25 data-[selected=true]:bg-sky-500/[0.12]"
          >
            <CommandEntityRow entity={entity} pinned={isPinned(entity)} {...(onTogglePin ? { onTogglePin } : {})} />
          </CommandItem>
        );
      })}
    </CommandResultGroup>
  );
}
