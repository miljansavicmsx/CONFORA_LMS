import type { JSX } from "react";

import { cn } from "@/lib/utils";

export function ConforaLogo({ className, mode = "full", presentational = false, size = "md" }: { readonly className?: string; readonly mode?: "full" | "icon"; readonly presentational?: boolean; readonly size?: "sm" | "md" | "lg" }): JSX.Element {
  const scale = size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl";
  return <span className={cn("inline-flex items-center gap-2 font-bold tracking-tight text-text-primary", scale, className)} aria-hidden={presentational || undefined} aria-label={presentational ? undefined : "CONFORA"}><span className="inline-flex h-[1.15em] w-[1.15em] items-center justify-center rounded-[0.3em] bg-brand text-[0.62em] font-black text-white">C</span>{mode === "full" ? <span>CONFORA</span> : null}</span>;
}
