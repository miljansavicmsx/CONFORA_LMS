/**
 * CONFORA design tokens — rhythm, semantics i domenske boje za premium enterprise UI.
 * Boje ostaju Tailwind klase usklađene s CSS varijablama tema (tamni shell u app-u).
 */

/** HR natpisi za bedževe (+ pristupačnost). Ne oslanjati se samo na boju u UI-u. */
export const statusLabelsHr = {
  active: { label: "Aktivan", aria: "Status: Aktivan" },
  pending: { label: "Na čekanju", aria: "Status: Na čekanju" },
  blocked: { label: "Blokiran", aria: "Status: Blokiran" },
  expired: { label: "Istekao", aria: "Status: Istekao" },
  suspended: { label: "Suspendovan", aria: "Status: Suspendovan" },
  verified: { label: "Verifikovan", aria: "Status: Verifikovan" },
  draft: { label: "Nacrt", aria: "Status: Nacrt" },
  review: { label: "U pregledu", aria: "Status: U pregledu" },
  approved: { label: "Odobreno", aria: "Status: Odobreno" },
  rejected: { label: "Odbijeno", aria: "Status: Odbijeno" },
} as const;

export type SemanticStatusKey = keyof typeof statusLabelsHr;

/** AI kopija — uvijek uz vizuelnu oznaku. */
export const aiCopyHr = {
  generated: "AI generisano",
  humanApproved: "Ljudski potvrđeno",
  needsApproval: "Zahtijeva ljudsku potvrdu",
} as const;

export const ds = {
  /** Maks širina enterprise ruta */
  pageMaxWidth: "mx-auto w-full max-w-[min(1600px,100%)] px-4 pb-14 pt-6 sm:px-6 lg:px-10",
  pageBackdrop:
    "pointer-events-none fixed inset-x-0 top-[var(--app-header-offset,0px)] -z-10 h-[min(42vh,480px)] bg-gradient-to-b from-brand/[0.09] via-transparent to-transparent opacity-95",

  /** Sekcije: vertikalni ritam */
  sectionGapSm: "space-y-4",
  sectionGapMd: "space-y-6",
  sectionGapLg: "space-y-8",
  sectionGapXl: "space-y-10",

  heroPanel:
    "rounded-3xl border border-white/[0.07] bg-surface-secondary/80 p-6 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.75)] ring-1 ring-white/[0.04] backdrop-blur-md sm:p-7",
  heroPanelTechnical:
    "rounded-3xl border border-sky-500/20 bg-gradient-to-br from-slate-950/90 via-surface-secondary/85 to-sky-500/[0.08] p-6 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.85)] ring-1 ring-sky-500/15 backdrop-blur-md sm:p-7",
  heroLearning:
    "rounded-3xl border border-sky-500/22 bg-gradient-to-br from-slate-950/80 via-surface-secondary/82 to-sky-500/[0.12] p-6 shadow-[0_28px_90px_-50px_rgba(14,165,233,0.45)] ring-1 ring-sky-400/18 backdrop-blur-md sm:p-7",
  heroTrust:
    "rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-surface-secondary/90 via-surface-secondary/75 to-emerald-500/[0.1] p-6 shadow-[0_28px_90px_-50px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/20 backdrop-blur-md sm:p-7",
  heroSystem:
    "rounded-3xl border border-orange-500/22 bg-gradient-to-br from-slate-950/88 via-surface-secondary/80 to-orange-500/[0.08] p-6 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.88)] ring-1 ring-orange-400/18 backdrop-blur-md sm:p-7",
  heroPublic:
    "rounded-3xl border border-white/[0.1] bg-gradient-to-br from-surface-secondary/88 to-brand/[0.08] p-6 shadow-[0_24px_70px_-40px_rgba(31,78,121,0.35)] ring-1 ring-white/[0.06] backdrop-blur-md sm:p-7",

  kpiCard:
    "min-w-[9.25rem] shrink-0 rounded-2xl border border-border/50 bg-surface-primary/45 p-3.5 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]",
  actionCard:
    "group flex flex-col justify-between rounded-2xl border border-border/50 bg-surface-primary/35 p-4 transition hover:border-brand/35 hover:bg-brand/[0.04]",
  ribbon: "rounded-2xl border border-border/45 bg-surface-secondary/55 p-4 backdrop-blur-sm",
  sectionTitle: "text-lg font-semibold tracking-tight text-text-primary",
  sectionEyebrow: "text-[11px] font-semibold uppercase tracking-[0.2em] text-brand",
  sectionEyebrowMuted: "text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted",

  widget:
    "rounded-2xl border border-border/50 bg-surface-secondary/60 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] backdrop-blur-sm",
  widgetDense: "rounded-xl border border-border/50 bg-surface-primary/35",

  gridKpi: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4",
  gridOps: "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3",

  /** Spacing (unutrašnjost kartica/modala) */
  spacing: {
    xs: "p-2 gap-2",
    sm: "p-3 gap-3",
    md: "p-4 gap-4",
    lg: "p-5 gap-4",
    xl: "p-6 gap-5",
    "2xl": "p-7 gap-6",
    "3xl": "p-8 gap-8",
  } as const,

  /** Radius */
  radius: {
    card: "rounded-2xl",
    panel: "rounded-3xl",
    pill: "rounded-full",
    modal: "rounded-2xl",
  } as const,

  /** Elevation / dubina — tamnom temom kompatibilno */
  elevation: {
    flat: "shadow-none ring-1 ring-border/45",
    raised: "shadow-[0_8px_32px_-24px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.04]",
    floating: "shadow-[0_24px_64px_-32px_rgba(0,0,0,0.75)] ring-1 ring-white/[0.05]",
    spotlight:
      "shadow-[0_32px_100px_-40px_rgba(14,165,233,0.22)] ring-1 ring-brand/15",
  } as const,

  /** Tipografija (Tailwind klase) */
  typography: {
    display: "text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.125rem]",
    title: "text-xl font-bold tracking-tight text-text-primary sm:text-2xl",
    section: "text-lg font-semibold tracking-tight text-text-primary",
    body: "text-sm leading-relaxed text-text-secondary",
    caption: "text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted",
    mono: "font-mono text-xs tabular-nums text-text-muted",
  } as const,

  /** Semantički akcent po produktnoj domeni */
  semantics: {
    learning: {
      accentBorder: "border-sky-500/35 bg-sky-500/[0.06]",
      accentBar: "border-l-[3px] border-l-sky-400/90",
      eyebrow: "text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-300",
    },
    governance: {
      accentBorder: "border-brand/30 bg-brand/[0.06]",
      accentBar: "border-l-[3px] border-l-brand",
      eyebrow: "text-[11px] font-semibold uppercase tracking-[0.22em] text-brand",
    },
    system: {
      accentBorder: "border-orange-500/35 bg-orange-500/[0.08]",
      accentBar: "border-l-[3px] border-l-orange-400",
      eyebrow: "text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-200",
    },
    ai: {
      accentBorder: "border-violet-500/40 bg-violet-500/[0.1]",
      accentBar: "border-l-[3px] border-l-violet-400",
      eyebrow: "text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-200",
    },
    trust: {
      accentBorder: "border-emerald-500/40 bg-emerald-500/[0.08]",
      accentBar: "border-l-[3px] border-l-emerald-400",
      eyebrow: "text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200",
    },
    neutral: {
      accentBorder: "border-border/50 bg-surface-primary/35",
      accentBar: "border-l-[3px] border-l-border",
      eyebrow: "text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted",
    },
    /** rizik kao signal, ne kao „destructive button” */
    risk: {
      accentBorder: "border-rose-500/35 bg-rose-500/[0.08]",
      accentBar: "border-l-[3px] border-l-rose-400",
      eyebrow: "text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-100",
    },
    warning: {
      accentBorder: "border-amber-500/40 bg-amber-500/[0.1]",
      accentBar: "border-l-[3px] border-l-amber-400",
      eyebrow: "text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-100",
    },
    success: {
      accentBorder: "border-emerald-500/40 bg-emerald-500/[0.1]",
      accentBar: "border-l-[3px] border-l-emerald-400",
      eyebrow: "text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-100",
    },
    danger: {
      accentBorder: "border-red-500/40 bg-red-500/[0.1]",
      accentBar: "border-l-[3px] border-l-red-400",
      eyebrow: "text-[11px] font-semibold uppercase tracking-[0.22em] text-red-100",
    },
  } as const,

  cockpitGovernanceShell:
    "rounded-2xl border border-white/[0.06] bg-gradient-to-br from-surface-secondary/95 via-surface-secondary/70 to-brand/[0.07] p-5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.85)] ring-1 ring-brand/10",
  cockpitTechnicalShell:
    "rounded-2xl border border-sky-500/22 bg-gradient-to-br from-slate-950/75 via-surface-secondary/80 to-sky-500/[0.1] p-5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)] ring-1 ring-sky-400/25",

  focusRing:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary",
  focusRingAi:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary",
  focusRingTrust:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary",

  emptyMuted:
    "rounded-2xl border border-dashed border-border/55 bg-surface-secondary/30 p-8 text-center sm:p-10",

  interactiveCard:
    "motion-safe:transition motion-safe:duration-200 hover:border-brand/40 hover:bg-surface-primary/55",

  iconButtonA11y:
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-surface-secondary/70 text-text-primary",

  /** Ugradnja labela tako da DS komponente mogu koristiti jedan import `ds`. */
  statusLabelsHr,
  aiCopyHr,
} as const;
