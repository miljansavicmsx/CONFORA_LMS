/**
 * Katalog AI Roleplay scenarija (ISO 17024 simulacija).
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Mic2 } from "lucide-react";
import { useCallback, type JSX } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
  fetchScenarios,
  saveRoleplaySessionMeta,
  startSession,
  type RoleplayScenarioItem,
} from "@/lib/api-roleplay";
import { cn } from "@/lib/utils";

const SCENARIOS_KEY = ["roleplay", "scenarios"] as const;

export default function RoleplayCatalog(): JSX.Element {
  const navigate = useNavigate();

  const { data: scenarios = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: SCENARIOS_KEY,
    queryFn: fetchScenarios,
  });

  const startMutation = useMutation({
    mutationFn: (scenarioId: string) => startSession(scenarioId),
    onSuccess: (res, scenarioId) => {
      const scenario = scenarios.find((s) => s.scenarioId === scenarioId);
      if (scenario) {
        saveRoleplaySessionMeta(res.sessionId, {
          scenarioTitle: scenario.title,
          aiPersonaName: scenario.aiPersonaName,
          aiPersonaRole: scenario.aiPersonaRole,
          scenarioId: scenario.scenarioId,
          maxAttempts: scenario.maxAttempts,
        });
      }
      void navigate(`/dashboard/admin/roleplay/${encodeURIComponent(res.sessionId)}`);
    },
  });

  const handleStart = useCallback(
    (s: RoleplayScenarioItem) => {
      startMutation.mutate(s.scenarioId);
    },
    [startMutation],
  );

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
              <Mic2 className="h-6 w-6 text-brand" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">AI Roleplay</h1>
              <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                ISO 17024 simulacije — odaberite scenarij i preuzmite ulogu auditora u razgovoru s AI
                personom.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 border-border/60 bg-surface-secondary/80 text-text-primary hover:bg-surface-tertiary"
            onClick={() => {
              void refetch();
            }}
            disabled={isFetching}
          >
            {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Osvježi
          </Button>
        </header>

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center gap-2 text-text-secondary">
            <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden />
            <span>Učitavanje scenarija…</span>
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
            Nije moguće učitati scenarije. Provjerite da API radi i da imate administratorsku ulogu.
          </div>
        ) : null}

        {!isLoading && !isError && scenarios.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/50 bg-surface-secondary/30 py-16 text-center text-text-muted">
            <p>Nema dostupnih scenarija u bazi.</p>
            <p className="mt-2 text-xs">Pokrenite seed skriptu (npr. seed_roleplay_demo.py).</p>
          </div>
        ) : null}

        {!isLoading && !isError && scenarios.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {scenarios.map((s) => (
              <li
                key={s.scenarioId}
                className={cn(
                  "flex flex-col rounded-2xl border border-border/50 bg-surface-secondary/50 p-6 ring-1 ring-white/[0.04]",
                  "transition-colors hover:border-brand/30 hover:bg-surface-secondary/80",
                )}
              >
                <h2 className="text-lg font-semibold text-text-primary">{s.title}</h2>
                <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-text-secondary">
                  {s.description}
                </p>
                <p className="mt-4 text-xs font-medium uppercase tracking-wider text-text-muted">
                  Uloga AI
                </p>
                <p className="text-sm text-text-primary">{s.aiPersonaRole}</p>
                <div className="mt-6 flex flex-1 flex-col justify-end">
                  <Button
                    type="button"
                    className="w-full bg-brand text-white hover:bg-brand/90"
                    disabled={startMutation.isPending}
                    onClick={() => {
                      handleStart(s);
                    }}
                  >
                    {startMutation.isPending && startMutation.variables === s.scenarioId ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Pokretanje…
                      </>
                    ) : (
                      "Započni audit"
                    )}
                  </Button>
                  {startMutation.isError && startMutation.variables === s.scenarioId ? (
                    <p className="mt-2 text-center text-xs text-red-400">
                      {startMutation.error instanceof Error
                        ? startMutation.error.message
                        : "Greška pri pokretanju sesije."}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
