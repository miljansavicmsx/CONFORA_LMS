import { type JSX } from "react";

export default function DashboardPlaceholder({
  title,
}: {
  readonly title: string;
}): JSX.Element {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">{title}</h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        Stranica je u pripremi.
      </p>
    </div>
  );
}
