import { type LucideIcon } from "lucide-react";
import { type JSX } from "react";

import { IsoPageShell } from "@/pages/iso/IsoPageShell";

export function IsoComingSoonPage({
  title,
  description,
  icon,
  body,
}: {
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly body?: string;
}): JSX.Element {
  return (
    <IsoPageShell title={title} description={description} icon={icon}>
      <div className="rounded-2xl border border-border/50 bg-surface-secondary/40 p-6 shadow-inner">
        <p className="text-sm leading-relaxed text-text-secondary">
          {body ??
            "Modul je u skladu s CONFORA arhitekturom pripremljen za povezivanje s APIjem. Koristite postojeće administracijske ili learnerske tokove dok se integracija ne proširi."}
        </p>
      </div>
    </IsoPageShell>
  );
}
