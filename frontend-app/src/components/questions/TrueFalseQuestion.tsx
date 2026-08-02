import { type JSX } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TrueFalseQuestion({
  prompt,
  value,
  onChange,
  disabled,
}: {
  readonly prompt: string;
  readonly value: boolean | null;
  readonly onChange: (v: boolean) => void;
  readonly disabled?: boolean;
}): JSX.Element {
  return (
    <div className="space-y-6">
      <p className="text-base font-semibold text-[hsl(var(--foreground))]">{prompt}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          type="button"
          size="lg"
          variant={value === true ? "default" : "outline"}
          className={cn(
            "h-auto min-h-[4rem] py-4 text-base",
            value === true && "bg-[#1F4E79] hover:bg-[#1F4E79]/90",
          )}
          disabled={disabled}
          onClick={() => onChange(true)}
        >
          Tačno
        </Button>
        <Button
          type="button"
          size="lg"
          variant={value === false ? "default" : "outline"}
          className={cn(
            "h-auto min-h-[4rem] py-4 text-base",
            value === false && "bg-[#1F4E79] hover:bg-[#1F4E79]/90",
          )}
          disabled={disabled}
          onClick={() => onChange(false)}
        >
          Netačno
        </Button>
      </div>
    </div>
  );
}
