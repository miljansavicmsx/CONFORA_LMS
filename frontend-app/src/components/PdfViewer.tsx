import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, type JSX } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PdfViewer({
  src,
  title,
  immersive = false,
}: {
  readonly src: string;
  readonly title: string;
  readonly immersive?: boolean;
}): JSX.Element {
  const [page, setPage] = useState(1);
  const iframeSrc = useMemo(() => {
    const base = src.split("#")[0] ?? src;
    if (!immersive || page <= 1) {
      return src;
    }
    return `${base}#page=${page}`;
  }, [src, page, immersive]);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border shadow-sm",
        immersive
          ? "max-h-[80vh] border-border/30 bg-surface-secondary/40"
          : "h-[min(70vh,640px)] rounded-lg border-[hsl(var(--border))] bg-[hsl(var(--muted))]",
      )}
    >
      <iframe
        title={title}
        src={iframeSrc}
        className="min-h-[50vh] w-full flex-1 border-0 bg-black/20 md:min-h-[60vh]"
      />
      {immersive ? (
        <div className="flex items-center justify-center gap-2 border-t border-border/30 bg-surface-primary/80 px-3 py-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-border/50 bg-transparent text-text-primary hover:bg-white/5"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Prethodna
          </Button>
          <span className="min-w-[4rem] text-center text-xs tabular-nums text-text-muted">
            Str.
            {page}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-border/50 bg-transparent text-text-primary hover:bg-white/5"
            onClick={() => setPage((p) => p + 1)}
          >
            Sljedeća
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
