import { type JSX, useEffect, useState } from "react";
import { Link } from "react-router";

import { ConforaLogo } from "@/components/ui/ConforaLogo";
import { fetchPublicLaunchMode, type LaunchMode } from "@/lib/api-public";

function launchCtas(mode: LaunchMode): { primary: { to: string; label: string }; secondary?: { to: string; label: string } } {
  if (mode === "closed_beta") {
    return { primary: { to: "/pricing", label: "Pricing (invite only)" } };
  }
  if (mode === "pilot") {
    return {
      primary: { to: "/book-demo", label: "Request demo" },
      secondary: { to: "/pricing", label: "View pricing" },
    };
  }
  if (mode === "limited_ga") {
    return {
      primary: { to: "/onboarding", label: "Join limited GA" },
      secondary: { to: "/pricing", label: "View pricing" },
    };
  }
  if (mode === "full_ga") {
    return {
      primary: { to: "/onboarding", label: "Start trial" },
      secondary: { to: "/pricing", label: "View pricing" },
    };
  }
  return {
    primary: { to: "/demo/start", label: "Start demo" },
    secondary: { to: "/pricing", label: "View pricing" },
  };
}

export default function LandingPage(): JSX.Element {
  const [mode, setMode] = useState<LaunchMode>("pilot");

  useEffect(() => {
    let cancelled = false;
    void fetchPublicLaunchMode()
      .then((m) => {
        if (!cancelled) {
          setMode(m);
        }
      })
      .catch(() => {
        /* offline / tests — ostaje pilot */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ctas = launchCtas(mode);

  return (
    <section aria-labelledby="landing-heading" className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-6 flex flex-col gap-2">
        <ConforaLogo size="lg" className="max-w-xs" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">LMS</p>
      </header>
      <h1 id="landing-heading" className="sr-only">
        CONFORA LMS
      </h1>
      <p className="mt-3 max-w-3xl text-text-secondary">
        AI-powered LMS and certification platform designed to support ISO/IEC 17024-aligned certification processes.
      </p>
      {mode === "closed_beta" ? (
        <p className="mt-4 text-sm text-amber-200/90">Launch mode: closed beta — public signup and trials are hidden.</p>
      ) : null}
      {mode === "pilot" ? (
        <p className="mt-4 text-sm text-text-secondary">
          Pilot program: request a demo; trials are reviewed manually before activation.
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link className="rounded-md bg-brand px-4 py-2 text-white" to={ctas.primary.to}>
          {ctas.primary.label}
        </Link>
        {ctas.secondary ? (
          <Link className="rounded-md border border-border/60 px-4 py-2" to={ctas.secondary.to}>
            {ctas.secondary.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
