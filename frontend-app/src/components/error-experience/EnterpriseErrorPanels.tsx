import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Clock3, Database, ServerCrash, ShieldAlert, WifiOff } from "lucide-react";
import type { ReactNode } from "react";

import { EnterpriseSectionHeader } from "@/design-system";
import { cn } from "@/lib/utils";

function PanelChrome({
  icon: Icon,
  role,
  variant,
  children,
}: {
  readonly icon: LucideIcon;
  readonly role: "alert" | "status" | "region";
  readonly variant: "error" | "warn" | "info";
  readonly children: ReactNode;
}): ReactNode {
  const border =
    variant === "error"
      ? "border-red-500/35 bg-red-500/5"
      : variant === "warn"
        ? "border-amber-500/35 bg-amber-500/5"
        : "border-border/50 bg-surface-secondary/25";
  return (
    <div
      className={cn("rounded-2xl border p-4", border)}
      role={role}
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", variant === "error" ? "text-red-300" : "text-brand")} aria-hidden />
        <div className="min-w-0 flex-1 space-y-2">{children}</div>
      </div>
    </div>
  );
}

export function EnterpriseErrorPanel({
  title,
  message,
  details,
  onRetry,
}: {
  readonly title: string;
  readonly message: string;
  readonly details?: ReactNode;
  readonly onRetry?: () => void;
}): ReactNode {
  return (
    <PanelChrome icon={ServerCrash} role="alert" variant="error">
      <EnterpriseSectionHeader title={title} description={message} titleLevel="h3" />
      {details ? <div className="text-sm text-text-secondary">{details}</div> : null}
      <p className="sr-only">Greška u učitavanju. Provjerite mrežu ili pokušajte ponovo.</p>
      {onRetry ? (
        <button
          type="button"
          className="rounded-lg border border-border/50 bg-surface-primary px-3 py-2 text-sm font-semibold text-brand outline-none focus-visible:ring-2 focus-visible:ring-brand"
          onClick={onRetry}
        >
          Pokušaj ponovo
        </button>
      ) : null}
    </PanelChrome>
  );
}

export function EnterpriseUnavailablePanel({
  title,
  message,
}: {
  readonly title: string;
  readonly message: string;
}): ReactNode {
  return (
    <PanelChrome icon={WifiOff} role="status" variant="warn">
      <EnterpriseSectionHeader title={title} description={message} titleLevel="h3" />
      <p className="sr-only">Podaci trenutno nisu dostupni.</p>
    </PanelChrome>
  );
}

export function EnterpriseTimeoutPanel({
  title,
  message,
  onRetry,
}: {
  readonly title: string;
  readonly message: string;
  readonly onRetry?: () => void;
}): ReactNode {
  return (
    <PanelChrome icon={Clock3} role="status" variant="warn">
      <EnterpriseSectionHeader title={title} description={message} titleLevel="h3" />
      <p className="sr-only">Zahtjev je istekao. Pokušajte ponovo ako je potrebno.</p>
      {onRetry ? (
        <button
          type="button"
          className="rounded-lg border border-border/50 px-3 py-2 text-sm font-semibold text-brand outline-none focus-visible:ring-2 focus-visible:ring-brand"
          onClick={onRetry}
        >
          Ponovi zahtjev
        </button>
      ) : null}
    </PanelChrome>
  );
}

export function EnterprisePartialDataPanel({
  title,
  message,
  children,
}: {
  readonly title: string;
  readonly message: string;
  readonly children?: ReactNode;
}): ReactNode {
  return (
    <PanelChrome icon={Database} role="status" variant="info">
      <EnterpriseSectionHeader title={title} description={message} titleLevel="h3" />
      {children ? <div className="text-sm text-text-secondary">{children}</div> : null}
      <p className="sr-only">Djelomični podaci — neke sekcije mogu biti nedostatne.</p>
    </PanelChrome>
  );
}

export function EnterpriseDegradedModeBanner({
  message,
}: {
  readonly message: string;
}): ReactNode {
  return (
    <div
      className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-50"
      role="status"
    >
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>{message}</p>
      <span className="sr-only">Degradirani mod — funkcionalnost može biti ograničena.</span>
    </div>
  );
}

export function EnterpriseStaleDataWarning({
  recordedAtLabel,
}: {
  readonly recordedAtLabel: string;
}): ReactNode {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-surface-secondary/30 px-3 py-2 text-xs text-text-secondary">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden />
      <span>Presjek podataka: {recordedAtLabel}. Osvježite prije formalnih odluka ako je potrebno.</span>
    </div>
  );
}
