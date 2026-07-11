import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CANDIDATE_PORTAL_NS } from "@confora/i18n";
import { Loader2, RefreshCw } from "lucide-react";
import { type JSX, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

import { CertificateSelector } from "@/components/learner/CertificateSelector";
import { Button } from "@/components/ui/button";
import { fetchMyCertificates } from "@/lib/api-certificates";
import {
  fetchMyRecertificationCase,
  listMyRecertifications,
  patchRecertificationInputs,
  submitRecertification,
  submitRecertificationForCertificate,
} from "@/lib/api-recertification";
import { filterCpdSelectorCertificates, resolveDefaultCertificateId } from "@/lib/certificate-selector";
import { useCandidatePortalStatusLabel } from "@/lib/candidate-portal-status-label";

const CERTIFICATES_QK = ["me", "certificates"] as const;
const RECERT_LIST_QK = ["recertification", "mine"] as const;

export default function MyRecertificationsPage(): JSX.Element {
  const { t } = useTranslation(CANDIDATE_PORTAL_NS);
  const statusLabel = useCandidatePortalStatusLabel();
  const [searchParams] = useSearchParams();
  const fallbackCertificateId = searchParams.get("certificateId");
  const qc = useQueryClient();

  const certificatesQuery = useQuery({
    queryKey: CERTIFICATES_QK,
    queryFn: fetchMyCertificates,
  });

  const selectorCertificates = useMemo(
    () => filterCpdSelectorCertificates(certificatesQuery.data ?? []),
    [certificatesQuery.data],
  );

  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null);

  useEffect(() => {
    const resolved = resolveDefaultCertificateId(selectorCertificates, fallbackCertificateId);
    setSelectedCertificateId((current) => {
      if (current && selectorCertificates.some((c) => c.certificateId === current)) {
        return current;
      }
      return resolved;
    });
  }, [selectorCertificates, fallbackCertificateId]);

  const fallbackActive = Boolean(
    fallbackCertificateId?.trim() &&
      selectedCertificateId === fallbackCertificateId.trim() &&
      selectorCertificates.some((c) => c.certificateId === fallbackCertificateId.trim()),
  );

  const recertCaseQuery = useQuery({
    queryKey: ["recertification", "case", selectedCertificateId] as const,
    queryFn: () => fetchMyRecertificationCase(selectedCertificateId as string),
    enabled: Boolean(selectedCertificateId),
    retry: false,
  });

  const listQuery = useQuery({
    queryKey: RECERT_LIST_QK,
    queryFn: listMyRecertifications,
  });

  const patchMutation = useMutation({
    mutationFn: (hours: number) =>
      patchRecertificationInputs(selectedCertificateId as string, { cpd_hours_recorded: hours }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["recertification", "case", selectedCertificateId] });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCertificateId) {
        throw new Error("No certificate selected");
      }
      try {
        return await submitRecertificationForCertificate(selectedCertificateId);
      } catch {
        const rows = listQuery.data ?? [];
        const draft = rows.find(
          (r) => r.certificateId === selectedCertificateId && r.status === "DRAFT",
        );
        if (!draft) {
          throw new Error("No draft recertification request");
        }
        return submitRecertification(draft.recertificationApplicationId);
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: RECERT_LIST_QK });
      await qc.invalidateQueries({ queryKey: ["recertification", "case", selectedCertificateId] });
    },
  });

  const cpdHours = useMemo(() => {
    const inputs = recertCaseQuery.data?.inputs as Record<string, unknown> | undefined;
    const raw = inputs?.cpd_hours_recorded;
    return typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) || 0 : 0;
  }, [recertCaseQuery.data]);

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <h1 className="text-2xl font-bold text-text-primary">{t("recertification.pageTitle")}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t("recertification.pageDescription")}</p>
        </header>

        <CertificateSelector
          certificates={selectorCertificates}
          selectedId={selectedCertificateId}
          onSelect={setSelectedCertificateId}
          loading={certificatesQuery.isLoading}
          error={certificatesQuery.isError}
          fallbackActive={fallbackActive}
        />

        {selectedCertificateId ? (
          <section className="rounded-xl border border-border/50 bg-surface-secondary/20 px-4 py-4" data-testid="cpd-recert-panel">
            {recertCaseQuery.isLoading ? (
              <p className="text-sm text-text-secondary">
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                {t("recertification.loadingCase")}
              </p>
            ) : null}
            {recertCaseQuery.isError ? (
              <p className="text-sm text-text-muted" data-testid="cpd-recert-no-case">
                {t("recertification.noCase")}
              </p>
            ) : null}
            {recertCaseQuery.data ? (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-text-primary" htmlFor="cpd-hours-input">
                  {t("recertification.cpdHoursLabel")}
                </label>
                <input
                  id="cpd-hours-input"
                  type="number"
                  min={0}
                  className="w-full max-w-xs rounded-lg border border-border/60 bg-surface px-3 py-2 text-sm"
                  value={cpdHours}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    if (Number.isFinite(next) && next >= 0) {
                      patchMutation.mutate(next);
                    }
                  }}
                  data-testid="cpd-hours-input"
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={submitMutation.isPending}
                  onClick={() => submitMutation.mutate()}
                  data-testid="cpd-submit-recertification"
                >
                  <RefreshCw className="mr-1 h-3.5 w-3.5" />
                  {t("recertification.submitCase")}
                </Button>
              </div>
            ) : null}
          </section>
        ) : null}

        <section>
          <h2 className="text-lg font-semibold text-text-primary">{t("recertification.listTitle")}</h2>
          {listQuery.isLoading ? (
            <div className="mt-4 text-text-secondary">
              <Loader2 className="inline h-5 w-5 animate-spin" /> {t("recertification.listLoading")}
            </div>
          ) : null}
          {listQuery.isError ? <p className="mt-4 text-red-400">{t("recertification.listError")}</p> : null}

          {!listQuery.isLoading && !listQuery.isError ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-border/50">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-secondary/70 text-text-muted">
                  <tr>
                    <th className="px-3 py-2">{t("recertification.tableId")}</th>
                    <th className="px-3 py-2">{t("recertification.tableCertificate")}</th>
                    <th className="px-3 py-2">{t("recertification.tableStatus")}</th>
                    <th className="px-3 py-2">{t("recertification.tableDue")}</th>
                    <th className="px-3 py-2 text-right">{t("recertification.tableActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(listQuery.data ?? []).map((r) => (
                    <tr key={r.recertificationApplicationId} className="border-t border-border/40">
                      <td className="px-3 py-2 font-mono text-xs">{r.recertificationApplicationId}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.certificateId}</td>
                      <td className="px-3 py-2">{statusLabel(r.status)}</td>
                      <td className="px-3 py-2">{r.recertificationDueAt || "—"}</td>
                      <td className="px-3 py-2 text-right">
                        {r.status === "DRAFT" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => submitMutation.mutate()}
                          >
                            <RefreshCw className="mr-1 h-3.5 w-3.5" />
                            {t("recertification.submit")}
                          </Button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                  {(listQuery.data ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-text-muted">
                        {t("recertification.listEmpty")}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
