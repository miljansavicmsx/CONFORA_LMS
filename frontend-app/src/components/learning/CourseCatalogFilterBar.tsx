import { Search } from "lucide-react";
import type { JSX } from "react";

import type { LmsCatalogAreaId } from "@/lib/lms-catalog-areas";
import { LMS_CATALOG_FILTERS } from "@/lib/lms-catalog-areas";
import { cn } from "@/lib/utils";

export function CourseCatalogFilterBar({
  selectedArea,
  onAreaChange,
  searchQuery,
  onSearchChange,
  searchId = "catalog-search",
}: {
  readonly selectedArea: LmsCatalogAreaId;
  readonly onAreaChange: (id: LmsCatalogAreaId) => void;
  readonly searchQuery: string;
  readonly onSearchChange: (q: string) => void;
  readonly searchId?: string;
}): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="relative max-w-xl">
        <label htmlFor={searchId} className="sr-only">
          Pretraga kurseva po nazivu, standardu ili oblasti
        </label>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          aria-hidden
        />
        <input
          id={searchId}
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Pretraži naziv, standard ili oblast…"
          autoComplete="off"
          className={cn(
            "w-full rounded-xl border border-border/50 bg-surface-secondary/80 py-2.5 pl-10 pr-3 text-sm text-text-primary",
            "placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25",
          )}
        />
      </div>

      <div
        className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto pb-1 pt-1"
        role="tablist"
        aria-label="Filtri oblasti programa"
      >
        {LMS_CATALOG_FILTERS.map((c) => {
          const active = selectedArea === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onAreaChange(c.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-brand bg-brand/15 text-brand shadow-sm"
                  : "border-border/60 bg-surface-secondary/80 text-text-secondary hover:border-border hover:bg-surface-secondary hover:text-text-primary",
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
