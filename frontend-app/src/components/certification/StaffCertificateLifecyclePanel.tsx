import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Activity, AlertCircle, Loader2, Zap } from "lucide-react";
import { useCallback, useState, type JSX } from "react";

import { Button } from "@/components/ui/button";
import {
  activateCertificate,
  fetchCertificateLifecycleStatus,
  mapStaffLifecycleError,
  type CertificateLifecycleStatusResponse,
} from "@/lib/api-staff-cert-lifecycle";
import { canActivateCertificate, canReadLifecyclePanel } from "@/lib/certification-lifecycle-access";
import { cn } from "@/lib/utils";

const LIFECYCLE_KEY = ["certificates", "lifecycle"] as const;

export type StaffCertificateLifecyclePanelProps = {
  readonly certificateId: string;
  readonly lifecycle: CertificateLifecycleStatusResponse | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly nestRoles: readonly string[];
};

export function StaffCertificateLifecyclePanel({
  certificateId,
  lifecycle,
  isLoading,
  isError,
  nestRoles,
}: StaffCertificateLifecyclePanelProps): JSX.Element | null {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const canRead = canReadLifecyclePanel(nestRoles);
  const canActivate = canActivateCertificate(nestRoles);

  const certStatus = lifecycle?.certificateStatus ?? "ISSUED";
  const lifecycleStatus = lifecycle?.lifecycleStatus ?? "—";

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [...LIFECYCLE_KEY, certificateId] });
  }, [certificateId, queryClient]);

  const activateMutation = useMutation({
    mutationFn: () => activateCertificate(certificateId, "F5-UI-2 operator activation"),
    onSuccess: async () => {
      setActionError(null);
      await invalidate();
    },
    onError: (e: unknown) => setActionError(mapStaffLifecycleError(e).messageKey),
  });

  if (!canRead) return null;

  return (
    <section
      className="rounded-xl border border-border/50 bg-surface-primary/50 p-4"
      data-testid="staff-lifecycle-panel"
    >
      <div className="mb-3 flex items-center gap-2">
        <Activity className="h-4 w-4 text-brand" aria-hidden />
        <h3 className="text-sm font-semibold text-text-primary">Životni ciklus certifikata (B12)</h3>
      </div>

      <p className="mb-3 text-xs text-text-muted" data-testid="lifecycle-boundary-note">
        Izdavanje (ISSUED) nije aktivacija (ACTIVE). Aktivacija je zaseban lifecycle korak.
      </p>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden />
          Učitavanje lifecycle statusa…
        </div>
      ) : isError ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Lifecycle podaci nisu dostupni.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3 text-xs">
            <span
              className={cn(
                "inline-flex rounded-md border px-2.5 py-1 font-medium",
                certStatus === "ACTIVE"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                  : "border-border/60 bg-surface-primary/80 text-text-secondary",
              )}
              data-testid="lifecycle-certificate-status"
            >
              certificateStatus: {certStatus}
            </span>
            <span
              className="inline-flex rounded-md border border-border/60 bg-surface-primary/80 px-2.5 py-1 font-medium text-text-secondary"
              data-testid="lifecycle-status-badge"
            >
              lifecycle: {lifecycleStatus}
            </span>
            {lifecycle?.certificateNumber ? (
              <span className="text-text-secondary" data-testid="lifecycle-cert-number">
                {lifecycle.certificateNumber}
              </span>
            ) : null}
          </div>

          {lifecycle?.verificationHash ? (
            <p className="text-xs text-text-secondary">
              Javna provjera:{" "}
              <a
                className="text-brand underline"
                href={`/verify/${encodeURIComponent(lifecycle.verificationHash)}`}
                target="_blank"
                rel="noreferrer"
                data-testid="lifecycle-verify-link"
              >
                /verify/{lifecycle.verificationHash.slice(0, 12)}…
              </a>
            </p>
          ) : null}

          {canActivate && certStatus === "ISSUED" ? (
            <Button
              type="button"
              size="sm"
              disabled={activateMutation.isPending}
              onClick={() => activateMutation.mutate()}
              data-testid="lifecycle-activate-button"
            >
              {activateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Zap className="mr-2 h-4 w-4" aria-hidden />
              )}
              Aktiviraj certifikat (ISSUED → ACTIVE)
            </Button>
          ) : null}

          {actionError ? (
            <p className="text-sm text-red-400" role="alert">
              {actionError}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

export { fetchCertificateLifecycleStatus };
