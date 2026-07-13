import type { JSX } from "react";

import { CommandEmpty, CommandItem, CommandList } from "@/components/ui/command";

import type { CommandEntity } from "./command-entity-types";
import { CommandEntityRow } from "./CommandEntityRow";
import { CommandResultGroup } from "./CommandResultGroup";
import type { CommandGroupModel } from "./command-search-engine";
import { stableCommandValue } from "./command-navigation";

type CommandResultListProps = {
  readonly groups: readonly CommandGroupModel[];
  readonly onSelect: (entity: CommandEntity, event: { readonly newTab: boolean }) => void;
  readonly onTogglePin?: (entity: CommandEntity) => void;
  readonly isPinned: (entity: CommandEntity) => boolean;
  readonly listboxId: string;
};

export function CommandResultList({
  groups,
  onSelect,
  onTogglePin,
  isPinned,
  listboxId,
}: CommandResultListProps): JSX.Element {
  return (
    <CommandList id={listboxId} aria-label="Rezultati pretrage" className="max-h-[min(58vh,440px)]">
        <CommandEmpty className="py-10 text-[#94A3B8]">Nema rezultata — probaj drugačiji pojam ili shortcut (npr. cert:).</CommandEmpty>
        {groups.map((g) => (
          <CommandResultGroup key={g.bucket} heading={g.label}>
            {g.entities.map((entity) => {
              const val = stableCommandValue(entity);
              const pinned = isPinned(entity);
              return (
                <CommandItem
                  key={val}
                  value={val}
                  keywords={[entity.title, entity.subtitle ?? "", entity.route, ...(entity.tags ?? []), entity.entityType].filter(
                    Boolean,
                  )}
                  onSelect={() => onSelect(entity, { newTab: false })}
                  className="items-start rounded-xl border border-transparent px-2 py-2 data-[selected=true]:border-sky-500/25 data-[selected=true]:bg-sky-500/[0.12]"
                >
                  <CommandEntityRow
                    entity={entity}
                    pinned={pinned}
                    {...(onTogglePin ? { onTogglePin } : {})}
                  />
                </CommandItem>
              );
            })}
          </CommandResultGroup>
        ))}
      </CommandList>
  );
}
