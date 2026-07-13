import type { JSX, ReactNode } from "react";

import { CommandGroup } from "@/components/ui/command";
import { cn } from "@/lib/utils";

type CommandResultGroupProps = {
  readonly heading: string;
  readonly children: ReactNode;
  readonly className?: string;
};

export function CommandResultGroup({ heading, children, className }: CommandResultGroupProps): JSX.Element {
  return (
    <CommandGroup
      heading={heading}
      className={cn(
        "[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:tracking-wider",
        className,
      )}
    >
      {children}
    </CommandGroup>
  );
}
