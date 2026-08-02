import { Info, ShoppingCart, Trash2 } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EnterpriseAlertBanner } from "@/design-system";
import { useCourseCartStore } from "@/store/courseCartStore";

function formatMoney(amount: number, currency = "EUR"): string {
  try {
    return new Intl.NumberFormat("bs-BA", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function CourseMiniCart({
  triggerLabel = "Korpa",
  open,
  onOpenChange,
}: {
  readonly triggerLabel?: string;
  readonly open?: boolean;
  readonly onOpenChange?: (o: boolean) => void;
}): JSX.Element {
  const items = useCourseCartStore((s) => s.items);
  const removeCourse = useCourseCartStore((s) => s.removeCourse);
  const clear = useCourseCartStore((s) => s.clear);
  const total = items.reduce((s, i) => s + i.price, 0);
  const controlled = open !== undefined && onOpenChange !== undefined;

  const body = (
    <>
      <DialogHeader>
        <DialogTitle>Korpa za plaćanje</DialogTitle>
        <DialogDescription>
          Odabrani programi nisu trajno kupljeni dok ne završite plaćanje. Naplata ide kroz postojeći finansijski modul.
        </DialogDescription>
      </DialogHeader>
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">Korpa je prazna. Dodajte plaćene programe iz detalja kursa.</p>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
          {items.map((line) => (
            <li
              key={line.courseId}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-surface-secondary/50 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-text-primary">{line.title}</p>
                <p className="text-xs text-text-muted">{formatMoney(line.price)}</p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="shrink-0 text-text-muted hover:text-destructive"
                aria-label={`Ukloni ${line.title}`}
                onClick={() => removeCourse(line.courseId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <EnterpriseAlertBanner severity="info" icon={Info} title="Plaćanje">
        Nastavak plaćanja koristi postojeći billing / Stripe tok u sustavu — nema novog backend košarice.
      </EnterpriseAlertBanner>
      <p className="text-sm font-semibold text-text-primary">
        Ukupno: {formatMoney(total)} · {items.length}{" "}
        {items.length === 1 ? "program" : "programa"}
      </p>
      <DialogFooter className="flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" onClick={() => clear()} disabled={items.length === 0}>
          Isprazni
        </Button>
        <Button asChild type="button" className="bg-brand text-white hover:bg-brand/90" disabled={items.length === 0}>
          <Link to="/dashboard/billing">Nastavi na plaćanje</Link>
        </Button>
      </DialogFooter>
    </>
  );

  if (controlled) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md border-border/60 bg-surface-primary text-text-primary sm:rounded-xl">
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="border-brand/40 text-brand">
          <ShoppingCart className="mr-2 h-4 w-4" aria-hidden />
          {triggerLabel}
          {items.length > 0 ? ` (${items.length})` : ""}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-border/60 bg-surface-primary text-text-primary sm:rounded-xl">
        {body}
      </DialogContent>
    </Dialog>
  );
}
