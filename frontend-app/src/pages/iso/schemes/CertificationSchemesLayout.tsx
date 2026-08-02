import { FileText, ScrollText, ShieldCheck } from "lucide-react";
import { type JSX } from "react";
import { NavLink, Outlet } from "react-router";

import { cn } from "@/lib/utils";

const linkBase =
  "rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-wide transition-colors border border-transparent";
const linkInactive = "text-text-secondary hover:bg-surface-primary/50 hover:border-border/40";
const linkActive = "bg-surface-secondary/70 text-brand border-brand/35 ring-1 ring-brand/15";

export default function CertificationSchemesLayout(): JSX.Element {
  return (
    <div className="min-h-[60vh] border-t border-border/30 bg-[radial-gradient(ellipse_at_top,_rgba(94,143,218,0.06),transparent_58%)]">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-8 rounded-2xl border border-border/45 bg-surface-secondary/30 p-5 ring-1 ring-white/[0.04] backdrop-blur-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand ring-1 ring-brand/22">
                <ShieldCheck className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Certification governance
                </p>
                <h1 className="text-xl font-semibold tracking-tight text-text-primary md:text-2xl">
                  Certifikacijske šeme
                </h1>
                <p className="max-w-prose text-sm leading-relaxed text-text-secondary">
                  Definicije shema kao centralnog koncepta ISO/IEC 17024, odvojene od dostave kurseva i banki pitanja.
                  Lifecycle: nacrt, formalni pregled odbora, odobrenje, aktivacija, arhiva.
                </p>
              </div>
            </div>
            <nav
              aria-label="Sheme navigacija"
              className="flex flex-wrap gap-2 border-t border-border/35 pt-4 md:border-t-0 md:pt-0"
            >
              <NavLink
                to=""
                end
                className={({ isActive }) => cn(linkBase, isActive ? linkActive : linkInactive)}
              >
                <span className="inline-flex items-center gap-2">
                  <ScrollText className="h-3.5 w-3.5" aria-hidden /> Registar
                </span>
              </NavLink>
              <NavLink
                to="new"
                className={({ isActive }) => cn(linkBase, isActive ? linkActive : linkInactive)}
              >
                <span className="inline-flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" aria-hidden /> Nova shema
                </span>
              </NavLink>
            </nav>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
