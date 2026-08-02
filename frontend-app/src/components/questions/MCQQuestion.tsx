import { type JSX } from "react";

import type { QuizOption } from "@/types/quiz";
import { cn } from "@/lib/utils";

export function MCQQuestion({
  prompt,
  options,
  value,
  onChange,
  disabled,
  name,
}: {
  readonly prompt: string;
  readonly options: readonly QuizOption[];
  readonly value: string | null;
  readonly onChange: (optionId: string) => void;
  readonly disabled?: boolean;
  readonly name: string;
}): JSX.Element {
  return (
    <fieldset className="space-y-4" disabled={disabled}>
      <legend className="text-base font-semibold text-[hsl(var(--foreground))]">{prompt}</legend>
      <div className="space-y-2" role="radiogroup" aria-label={prompt}>
        {options.map((opt) => {
          const sel = value === opt.id;
          return (
            <label
              key={opt.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                "hover:border-[#1F4E79]/50 hover:bg-[hsl(var(--muted))]/40",
                sel ? "border-[#1F4E79] bg-[#1F4E79]/10" : "border-[hsl(var(--border))] bg-[hsl(var(--card))]",
                disabled && "pointer-events-none opacity-60",
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt.id}
                checked={sel}
                onChange={() => onChange(opt.id)}
                className="mt-1 h-4 w-4 accent-[#1F4E79]"
              />
              <span className="text-sm leading-relaxed text-[hsl(var(--foreground))]">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
