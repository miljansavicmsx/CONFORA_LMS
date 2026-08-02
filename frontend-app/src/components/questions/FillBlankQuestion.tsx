import { useEffect, useState, type JSX } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 400;

function normalize(s: string, caseSensitive: boolean): string {
  const t = s.trim();
  return caseSensitive ? t : t.toLowerCase();
}

function matches(typed: string, acceptable: readonly string[], caseSensitive: boolean): boolean {
  const u = normalize(typed, caseSensitive);
  if (!u) {
    return false;
  }
  return acceptable.some((a) => normalize(a, caseSensitive) === u);
}

export function FillBlankQuestion({
  prompt,
  acceptableAnswers,
  caseSensitive = false,
  value,
  onChange,
  disabled,
}: {
  readonly prompt: string;
  readonly acceptableAnswers: readonly string[];
  readonly caseSensitive?: boolean;
  readonly value: string;
  readonly onChange: (text: string) => void;
  readonly disabled?: boolean;
}): JSX.Element {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [value]);

  const valid = matches(debounced, acceptableAnswers, caseSensitive);

  return (
    <div className="space-y-3">
      <Label htmlFor="fill-blank-input" className="text-base font-semibold text-[hsl(var(--foreground))]">
        {prompt}
      </Label>
      <Input
        id="fill-blank-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Upišite odgovor"
        autoComplete="off"
        className={cn(
          valid && debounced.trim() !== "" && "border-emerald-600 ring-emerald-600/30",
        )}
        aria-invalid={debounced.trim() !== "" && !valid}
      />
      {debounced.trim() !== "" ? (
        <p
          className={cn(
            "text-xs",
            valid ? "font-medium text-emerald-700" : "text-[hsl(var(--muted-foreground))]",
          )}
          role="status"
        >
          {valid ? "Odgovor se poklapa s očekivanim oblikom." : "Još nije tačno — provjerite pravopis ili sinonim."}
        </p>
      ) : null}
    </div>
  );
}
