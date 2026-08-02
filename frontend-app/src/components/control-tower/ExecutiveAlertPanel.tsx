import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Link } from "react-router";
import { type JSX } from "react";

import { cn } from "@/lib/utils";
import type { ExecutiveAlert } from "@/lib/operations-intelligence/intelligence-types";

export function ExecutiveAlertPanel({ alerts }: { readonly alerts: readonly ExecutiveAlert[] }): JSX.Element {
  return (
    <section aria-label="Executive alerti" className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Alert engine</p>
      <ul className="space-y-2">
        {alerts.length ? (
          alerts.map((a) => (
            <li
              key={a.id}
              className={cn(
                "flex gap-3 rounded-xl border px-3 py-2 text-sm ring-1 ring-white/[0.03]",
                a.severity === "critical" && "border-rose-500/50 bg-rose-600/10",
                a.severity === "warning" && "border-amber-500/45 bg-amber-500/10",
                a.severity === "info" && "border-sky-500/35 bg-sky-500/10",
              )}
            >
              <span className="mt-0.5 shrink-0">
                {a.severity === "critical" ? (
                  <ShieldAlert className="h-4 w-4 text-rose-200" aria-hidden />
                ) : a.severity === "warning" ? (
                  <AlertTriangle className="h-4 w-4 text-amber-200" aria-hidden />
                ) : (
                  <Info className="h-4 w-4 text-sky-200" aria-hidden />
                )}
              </span>
              <div>
                <p className="font-semibold text-text-primary">{a.title}</p>
                <p className="text-xs text-text-secondary">{a.detail}</p>
                {a.metric ? (
                  <p className="mt-1 font-mono text-[11px] text-text-muted">Metrika: {a.metric}</p>
                ) : null}
                {a.route ? (
                  <Link className="mt-1 inline-block text-xs font-medium text-brand hover:underline" to={a.route}>
                    Otvori modul →
                  </Link>
                ) : null}
              </div>
            </li>
          ))
        ) : (
          <li className="rounded-xl border border-border/40 bg-surface-secondary/30 px-3 py-2 text-sm text-text-muted">
            Nema aktivnih alerta iz pravila — sustav je u dinamičkoj zoni ili nema dovoljno signala.
          </li>
        )}
      </ul>
    </section>
  );
}
