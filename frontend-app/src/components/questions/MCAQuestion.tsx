import { type JSX } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { QuizOption } from "@/types/quiz";
import { cn } from "@/lib/utils";

export function MCAQuestion({
  prompt,
  options,
  value,
  onChange,
  disabled,
}: {
  readonly prompt: string;
  readonly options: readonly QuizOption[];
  readonly value: readonly string[];
  readonly onChange: (next: string[]) => void;
  readonly disabled?: boolean;
}): JSX.Element {
  const toggle = (id: string, checked: boolean): void => {
    if (checked) {
      onChange([...value, id]);
    } else {
      onChange(value.filter((x) => x !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-base font-semibold text-[hsl(var(--foreground))]">{prompt}</p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Odaberi sve tačne odgovore.</p>
      </div>
      <div className="space-y-2">
        {options.map((opt) => {
          const checked = value.includes(opt.id);
          return (
            <div
              key={opt.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                "hover:border-[#1F4E79]/50 hover:bg-[hsl(var(--muted))]/40",
                checked ? "border-[#1F4E79] bg-[#1F4E79]/10" : "border-[hsl(var(--border))] bg-[hsl(var(--card))]",
                disabled && "pointer-events-none opacity-60",
              )}
            >
              <Checkbox
                id={`${opt.id}-mca`}
                checked={checked}
                disabled={disabled}
                onCheckedChange={(v) => toggle(opt.id, v === true)}
                className="mt-0.5"
                aria-label={opt.label}
              />
              <Label htmlFor={`${opt.id}-mca`} className="cursor-pointer text-sm font-normal leading-relaxed">
                {opt.label}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
