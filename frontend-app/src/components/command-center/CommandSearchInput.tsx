import type { ComponentPropsWithoutRef, JSX } from "react";
import { forwardRef } from "react";

import { CommandInput } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type CommandSearchInputProps = ComponentPropsWithoutRef<typeof CommandInput>;

export const CommandSearchInput = forwardRef<HTMLInputElement, CommandSearchInputProps>(function CommandSearchInput(
  { className, ...props },
  ref,
): JSX.Element {
  return (
    <CommandInput
      ref={ref}
      className={cn("placeholder:text-[#64748B]", className)}
      aria-describedby="command-center-search-hint"
      {...props}
    />
  );
});
