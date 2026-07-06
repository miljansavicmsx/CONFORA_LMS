import { Loader2 } from "lucide-react";
import { useMemo, useState, type JSX } from "react";

import { Button } from "@/components/ui/button";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseDateInput(value: string): Date | null {
  const t = value.trim();
  if (!t) return null;
  if (!DATE_RE.test(t)) return null;
  const d = new Date(`${t}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export type ReportDateFilterBarProps = {
  readonly onRefresh: () => void;
  readonly isFetching?: boolean;
  readonly hint?: string;
};

export function ReportDateFilterBar({
  onRefresh,
  isFetching = false,
  hint,
}: ReportDateFilterBarProps): JSX.Element {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [validation, setValidation] = useState<string | null>(null);

  const canRefresh = useMemo(() => {
    if (!from.trim() && !to.trim()) return true;
    const fromD = from.trim() ? parseDateInput(from) : null;
    const toD = to.trim() ? parseDateInput(to) : null;
    if (from.trim() && !fromD) return false;
    if (to.trim() && !toD) return false;
    if (fromD && toD && fromD > toD) return false;
    return true;
  }, [from, to]);

  const handleRefresh = (): void => {
    if (!canRefresh) {
      if (from.trim() && !parseDateInput(from)) {
        setValidation("Datum „Od“ mora biti u formatu YYYY-MM-DD.");
        return;
      }
      if (to.trim() && !parseDateInput(to)) {
        setValidation("Datum „Do“ mora biti u formatu YYYY-MM-DD.");
        return;
      }
      const fromD = parseDateInput(from);
      const toD = parseDateInput(to);
      if (fromD && toD && fromD > toD) {
        setValidation("Datum „Od“ ne može biti nakon datuma „Do“.");
        return;
      }
      setValidation("Provjerite unesene datume.");
      return;
    }
    setValidation(null);
    onRefresh();
  };

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-surface-secondary/35 p-4 sm:flex-row sm:items-end sm:justify-between"
      data-testid="admin-report-date-filter"
    >
      <div className="flex flex-wrap gap-3">
        <div>
          <label htmlFor="admin-rep-from" className="text-xs text-text-muted">
            Od
          </label>
          <input
            id="admin-rep-from"
            type="text"
            inputMode="numeric"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 block h-9 w-36 rounded-md border border-border/60 bg-surface-primary px-2 text-sm"
            placeholder="YYYY-MM-DD"
            data-testid="admin-report-date-from"
          />
        </div>
        <div>
          <label htmlFor="admin-rep-to" className="text-xs text-text-muted">
            Do
          </label>
          <input
            id="admin-rep-to"
            type="text"
            inputMode="numeric"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 block h-9 w-36 rounded-md border border-border/60 bg-surface-primary px-2 text-sm"
            placeholder="YYYY-MM-DD"
            data-testid="admin-report-date-to"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-5 border-border/60"
          onClick={handleRefresh}
          disabled={isFetching}
          data-testid="admin-report-refresh-btn"
        >
          {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
          Osvježi izvještaj
        </Button>
      </div>
      <div className="max-w-md space-y-1 text-xs text-text-secondary">
        {validation ? (
          <p className="text-destructive" role="alert" data-testid="admin-report-date-validation">
            {validation}
          </p>
        ) : null}
        <p>{hint ?? "Prazni datumi koriste zadani raspon izvještaja. Za brže učitavanje birajte kraće raspone."}</p>
      </div>
    </div>
  );
}
