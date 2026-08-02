import { A11Y_NS } from "@confora/i18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { type JSX } from "react";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchMyRegistryProfile, patchMyRegistryProfile } from "@/lib/api-user-registry";
import { isNestAuthPilotActive } from "@/lib/nest-auth-pilot";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

const PROFILE_Q = ["me", "registry-profile"] as const;

export default function DashboardProfilePage(): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  const qc = useQueryClient();
  const { t } = useTranslation(A11Y_NS);
  const pilotActive = isNestAuthPilotActive();

  const regQ = useQuery({
    queryKey: PROFILE_Q,
    queryFn: fetchMyRegistryProfile,
    enabled: !pilotActive,
  });

  const saveM = useMutation({
    mutationFn: patchMyRegistryProfile,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: PROFILE_Q });
    },
  });

  const reg = regQ.data;

  return (
    <div className="max-w-lg space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Profil</h1>
        <p className="mt-1 text-sm text-text-secondary">Osnovni podaci vašeg naloga.</p>
      </div>
      <dl className="space-y-4 rounded-xl border border-border/50 bg-surface-secondary/30 p-6">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">Ime</dt>
          <dd className="mt-1 text-text-primary">{user.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">Email</dt>
          <dd className="mt-1 text-text-primary">{user.email || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">Uloga</dt>
          <dd className="mt-1 text-text-primary">{user.role}</dd>
        </div>
      </dl>

      {pilotActive ? (
        <section
          className="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 text-sm text-text-secondary"
          role="status"
        >
          {t("nest_auth_pilot_registry_unavailable")}
        </section>
      ) : (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Prošireni podaci (§12.1)</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Informacije za certifikaciju: kontakt, JMBG/ID i stručna polja. Status verifikacije dokumenta odobrava uloga SME /
              SysAdmin.
            </p>
          </div>

          {regQ.isLoading ? (
            <div className="flex justify-center rounded-xl border border-border/50 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden />
            </div>
          ) : regQ.isError ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              Ne mogu učitati registar — provjerite backend i sesiju.
            </p>
          ) : reg ? (
            <form
              className="space-y-4 rounded-xl border border-border/50 bg-surface-secondary/30 p-6"
              onSubmit={(e) => {
                e.preventDefault();
                void saveM.mutateAsync({
                  phone: reg.phone ?? "",
                  nationalId: reg.nationalId ?? "",
                  jobTitle: reg.jobTitle ?? "",
                  educationLevel: reg.educationLevel ?? "",
                });
              }}
            >
              <div className="rounded-lg border border-brand/25 bg-brand/10 px-3 py-2 text-xs text-text-secondary">
                Status verifikacije dokumenata:{" "}
                <span className="font-semibold text-brand">{reg.identityVerificationStatus}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rp-phone">Telefon</Label>
                <Input
                  id="rp-phone"
                  value={reg.phone ?? ""}
                  onChange={(e) => {
                    qc.setQueryData(PROFILE_Q, { ...reg, phone: e.target.value });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rp-jmbg">JMBG / nacionalni ID</Label>
                <Input
                  id="rp-jmbg"
                  value={reg.nationalId ?? ""}
                  onChange={(e) => {
                    qc.setQueryData(PROFILE_Q, { ...reg, nationalId: e.target.value });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rp-job">Trenutna pozicija</Label>
                <Input
                  id="rp-job"
                  value={reg.jobTitle ?? ""}
                  onChange={(e) => {
                    qc.setQueryData(PROFILE_Q, { ...reg, jobTitle: e.target.value });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rp-edu">Stručna sprema</Label>
                <Input
                  id="rp-edu"
                  value={reg.educationLevel ?? ""}
                  onChange={(e) => {
                    qc.setQueryData(PROFILE_Q, { ...reg, educationLevel: e.target.value });
                  }}
                />
              </div>
              {reg.organizationName ? (
                <div className="space-y-1 text-sm">
                  <span className="text-text-muted">Povezana organizacija</span>
                  <p className="font-medium text-text-primary">{reg.organizationName}</p>
                </div>
              ) : null}
              <Button type="submit" disabled={saveM.isPending}>
                {saveM.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    Spremanje…
                  </>
                ) : (
                  "Spremi proširene podatke"
                )}
              </Button>
            </form>
          ) : null}
        </section>
      )}
    </div>
  );
}
