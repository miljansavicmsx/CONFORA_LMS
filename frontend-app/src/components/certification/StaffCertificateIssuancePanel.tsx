import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Award, FileText, Loader2, PlayCircle } from "lucide-react";
import { useCallback, useState, type JSX } from "react";

import { Button } from "@/components/ui/button";
import {
  fetchCertificateDocument,
  fetchCertificateIssuance,
  generateCertificateDocument,
  issueCertificate,
  mapStaffIssuanceError,
  startCertificateIssuance,
  type CertificateIssuanceResponse,
} from "@/lib/api-staff-cert-issuance";
import {
  canGenerateCertificateDocument,
  canIssueCertificate,
  canReadIssuancePanel,
  canStartIssuance,
} from "@/lib/certification-issuance-access";
import { cn } from "@/lib/utils";

const CERT_APPLICATIONS_KEY = ["certification", "applications", "staff"] as const;

export type StaffCertificateIssuancePanelProps = {
  readonly applicationId: string;
  readonly issuance: CertificateIssuanceResponse | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly nestRoles: readonly string[];
};

export function StaffCertificateIssuancePanel({
  applicationId,
  issuance,
  isLoading,
  isError,
  nestRoles,
}: StaffCertificateIssuancePanelProps): JSX.Element | null {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const canRead = canReadIssuancePanel(nestRoles);
  const canStart = canStartIssuance(nestRoles);
  const canIssue = canIssueCertificate(nestRoles);
  const canGenerate = canGenerateCertificateDocument(nestRoles);

  const reviewStatus = issuance?.certificateIssuanceReview?.status ?? "NOT_STARTED";
  const cert = issuance?.certificate ?? null;

  const documentQ = useQuery({
    queryKey: [...CERT_APPLICATIONS_KEY, "issuance-document", applicationId],
    queryFn: () => fetchCertificateDocument(applicationId),
    enabled: canRead && Boolean(cert),
  });

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [...CERT_APPLICATIONS_KEY, "issuance", applicationId],
    });
    await queryClient.invalidateQueries({
      queryKey: [...CERT_APPLICATIONS_KEY, "issuance-document", applicationId],
    });
  }, [applicationId, queryClient]);

  const startMutation = useMutation({
    mutationFn: () => startCertificateIssuance(applicationId),
    onSuccess: async () => {
      setActionError(null);
      await invalidate();
    },
    onError: (e: unknown) => setActionError(mapStaffIssuanceError(e).messageKey),
  });

  const issueMutation = useMutation({
    mutationFn: () => issueCertificate(applicationId),
    onSuccess: async () => {
      setActionError(null);
      await invalidate();
    },
    onError: (e: unknown) => setActionError(mapStaffIssuanceError(e).messageKey),
  });

  const generateMutation = useMutation({
    mutationFn: () => generateCertificateDocument(applicationId),
    onSuccess: async () => {
      setActionError(null);
      await invalidate();
    },
    onError: (e: unknown) => setActionError(mapStaffIssuanceError(e).messageKey),
  });

  if (!canRead) return null;

  return (
    <section
      className="rounded-xl border border-border/50 bg-surface-primary/50 p-4"
      data-testid="staff-issuance-panel"
    >
      <div className="mb-3 flex items-center gap-2">
        <Award className="h-4 w-4 text-brand" aria-hidden />
        <h3 className="text-sm font-semibold text-text-primary">Izdavanje certifikata (B11)</h3>
      </div>

      <p className="mb-3 text-xs text-text-muted" data-testid="issuance-boundary-note">
        Izdavanje je odvojeno od odluke o certifikaciji. Status ISSUED nije ACTIVE — aktivacija je lifecycle korak.
      </p>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden />
          Učitavanje izdavanja…
        </div>
      ) : isError ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Izdavanje nije dostupno za ovu prijavu.
        </div>
      ) : (
        <div className="space-y-3">
          <span
            className={cn(
              "inline-flex rounded-md border px-2.5 py-1 text-xs font-medium",
              reviewStatus === "ISSUED"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                : "border-border/60 bg-surface-primary/80 text-text-secondary",
            )}
            data-testid="issuance-status-badge"
          >
            {reviewStatus}
          </span>

          {cert ? (
            <div className="space-y-1 text-xs text-text-secondary" data-testid="issuance-certificate-info">
              <p>
                Broj certifikata:{" "}
                <span className="font-mono font-medium text-text-primary" data-testid="certificate-number">
                  {cert.certificateNumber}
                </span>
              </p>
              <p>
                Javna provjera:{" "}
                <a
                  className="text-brand underline"
                  href={`/verify/${encodeURIComponent(cert.verificationHash)}`}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="issuance-verify-link"
                >
                  /verify/{cert.verificationHash.slice(0, 12)}…
                </a>
              </p>
              <p>
                Status certifikata:{" "}
                <span className="font-medium text-text-primary">{cert.status}</span> (nije ACTIVE)
              </p>
            </div>
          ) : null}

          {canStart && reviewStatus === "NOT_STARTED" ? (
            <Button
              type="button"
              size="sm"
              disabled={startMutation.isPending}
              onClick={() => startMutation.mutate()}
              data-testid="issuance-start-button"
            >
              {startMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <PlayCircle className="mr-2 h-4 w-4" aria-hidden />
              )}
              Započni izdavanje
            </Button>
          ) : null}

          {canIssue && reviewStatus === "IN_PROGRESS" ? (
            <Button
              type="button"
              size="sm"
              disabled={issueMutation.isPending}
              onClick={() => issueMutation.mutate()}
              data-testid="issuance-issue-button"
            >
              {issueMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Izdaj certifikat
            </Button>
          ) : null}

          {canGenerate && cert ? (
            <div className="rounded-lg border border-border/40 p-3">
              <p className="mb-2 flex items-center gap-2 text-xs font-medium text-text-secondary">
                <FileText className="h-3.5 w-3.5" aria-hidden />
                PDF dokument
              </p>
              {documentQ.data?.documentGenerated ? (
                <p className="text-xs text-emerald-200/90" data-testid="pdf-status">
                  Generirano — checksum {documentQ.data.checksumSha256?.slice(0, 16) ?? "n/a"}…
                </p>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={generateMutation.isPending}
                  onClick={() => generateMutation.mutate()}
                  data-testid="issuance-generate-pdf-button"
                >
                  Generiraj PDF
                </Button>
              )}
            </div>
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

export { fetchCertificateIssuance };
