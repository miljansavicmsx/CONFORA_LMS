/**
 * SysAdmin — §12.1 registar korisnika (JMBG/ID, kompanija, verifikacija dokumenata).
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2, Shield, Users } from "lucide-react";
import { useCallback, useMemo, useState, type JSX } from "react";

import { ManualIdentityReviewPanel } from "@/components/admin/ManualIdentityReviewPanel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createOrganization,
  fetchOrganizations,
  fetchRegistryUsers,
  patchRegistryUser,
  type IdentityVerificationStatus,
  type OrganizationRow,
  type UserRegistryRow,
} from "@/lib/api-user-registry";
import { cn } from "@/lib/utils";

const QUERY = ["admin", "user-registry"] as const;

const DEMO_SYNTHETIC_USER: UserRegistryRow = {
  userId: "b2000000-0000-4000-8000-000000000001",
  email: "pilot.learner@confora.test",
  fullName: "Pilot Learner (synthetic demo)",
  role: "learner",
  nationalId: "0000000000000",
  identityVerificationStatus: "pending",
  identityNotes: "F5-UI-2 synthetic identity review — non-biometric MVP",
  identityDocumentIdKey: "uploads/demo/synthetic-id-scan.pdf",
  identityDocumentDiplomaKey: null,
};

function statusBadgeClass(s: IdentityVerificationStatus): string {
  switch (s) {
    case "verified":
      return "border-emerald-500/40 bg-emerald-500/15 text-emerald-200";
    case "pending":
      return "border-amber-500/40 bg-amber-500/15 text-amber-100";
    case "rejected":
      return "border-red-500/40 bg-red-500/15 text-red-200";
    default:
      return "border-border/50 bg-surface-secondary text-text-muted";
  }
}

export default function UserRegistryPage(): JSX.Element {
  const qc = useQueryClient();
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [edit, setEdit] = useState<UserRegistryRow | null>(null);
  const [demoUser, setDemoUser] = useState<UserRegistryRow>(DEMO_SYNTHETIC_USER);
  const [orgDialog, setOrgDialog] = useState(false);
  const [newOrg, setNewOrg] = useState({ legalName: "", registrationNumber: "", country: "" });

  const listQ = useQuery({
    queryKey: [...QUERY, "list", cursor ?? "start"],
    queryFn: () =>
      fetchRegistryUsers({
        limit: 40,
        ...(cursor != null ? { cursor } : {}),
      }),
  });

  const orgsQ = useQuery({
    queryKey: [...QUERY, "orgs"],
    queryFn: () => fetchOrganizations(),
  });

  const items = listQ.data?.items ?? [];

  const saveM = useMutation({
    mutationFn: async () => {
      if (!edit) {
        return;
      }
      await patchRegistryUser(edit.userId, {
        ...(edit.fullName !== undefined && edit.fullName !== null ? { fullName: edit.fullName } : {}),
        role: edit.role,
        phone: edit.phone ?? null,
        nationalId: edit.nationalId ?? null,
        jobTitle: edit.jobTitle ?? null,
        educationLevel: edit.educationLevel ?? null,
        organizationId: edit.organizationId ?? null,
        identityVerificationStatus: edit.identityVerificationStatus,
        identityNotes: edit.identityNotes ?? null,
        identityDocumentIdKey: edit.identityDocumentIdKey ?? null,
        identityDocumentDiplomaKey: edit.identityDocumentDiplomaKey ?? null,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QUERY });
      setEdit(null);
    },
  });

  const createOrgM = useMutation({
    mutationFn: async () => {
      await createOrganization({
        legalName: newOrg.legalName.trim(),
        ...(newOrg.registrationNumber.trim()
          ? { registrationNumber: newOrg.registrationNumber.trim() }
          : {}),
        ...(newOrg.country.trim() ? { country: newOrg.country.trim() } : {}),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [...QUERY, "orgs"] });
      setOrgDialog(false);
      setNewOrg({ legalName: "", registrationNumber: "", country: "" });
    },
  });

  const nextCursor = listQ.data?.nextCursor ?? null;

  const goNext = useCallback(() => {
    if (!nextCursor) {
      return;
    }
    setCursorStack((s) => [...s, cursor ?? ""]);
    setCursor(nextCursor);
  }, [cursor, nextCursor]);

  const goPrev = useCallback(() => {
    setCursorStack((stack) => {
      if (stack.length === 0) {
        setCursor(null);
        return stack;
      }
      const prev = stack[stack.length - 1] as string | undefined;
      setCursor(prev === undefined || prev === "" ? null : prev);
      return stack.slice(0, -1);
    });
  }, []);

  const orgOptions: readonly OrganizationRow[] = orgsQ.data ?? [];

  const orgNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const o of orgOptions) {
      m.set(o.organizationId, o.legalName);
    }
    return m;
  }, [orgOptions]);

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
              <Users className="h-6 w-6 text-brand" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary" data-testid="user-registry-heading">
                Registar korisnika
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                §12.1 — JMBG/ID, pravno lice, uloga i status verifikacije identiteta (dokumenti).
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 border-border/60 bg-surface-secondary/80"
            onClick={() => {
              setOrgDialog(true);
            }}
          >
            <Building2 className="mr-2 h-4 w-4" aria-hidden />
            Nova organizacija
          </Button>
        </header>

        <div className="overflow-x-auto rounded-xl border border-border/50 bg-surface-secondary/40 ring-1 ring-white/[0.04]">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-surface-primary/50 text-xs uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Ime</th>
                <th className="px-4 py-3 font-semibold">Uloga</th>
                <th className="px-4 py-3 font-semibold">JMBG / ID</th>
                <th className="px-4 py-3 font-semibold">Organizacija</th>
                <th className="px-4 py-3 font-semibold">Verifikacija</th>
                <th className="px-4 py-3 font-semibold"> </th>
              </tr>
            </thead>
            <tbody>
              {listQ.isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-text-muted">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand" aria-hidden />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                    Nema korisnika u ovom pregledu.
                  </td>
                </tr>
              ) : (
                items.map((u) => (
                  <tr key={u.userId} className="border-b border-border/30 transition-colors hover:bg-surface-primary/30">
                    <td className="px-4 py-3 font-mono text-xs text-brand">{u.email}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-text-primary">{u.fullName ?? "—"}</td>
                    <td className="px-4 py-3 text-text-secondary">{u.role}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{u.nationalId ?? "—"}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-text-secondary">
                      {u.organizationName ?? (u.organizationId ? orgNameById.get(u.organizationId) ?? u.organizationId : "—")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                          statusBadgeClass(u.identityVerificationStatus),
                        )}
                      >
                        {u.identityVerificationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-brand hover:bg-brand/10"
                        data-testid={`user-registry-edit-${u.userId}`}
                        onClick={() => {
                          setEdit({ ...u });
                        }}
                      >
                        Uredi
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={cursorStack.length === 0} onClick={goPrev}>
              Nazad
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={!nextCursor} onClick={goNext}>
              Sljedeća stranica
            </Button>
          </div>
          <p className="text-xs text-text-muted">
            Paginacija Scan — za produkciju dodati GSI (npr. po emailu ili ulozi).
          </p>
        </div>

        {(listQ.isError || (!listQ.isLoading && items.length === 0)) ? (
          <div className="mt-8 space-y-3" data-testid="manual-id-demo-fallback">
            <p className="text-sm text-amber-200/90">
              Registar nije dostupan (legacy FastAPI) ili je prazan — prikazujemo sintetički demo pregled identiteta.
            </p>
            <ManualIdentityReviewPanel
              user={demoUser}
              onStatusChange={(status) => setDemoUser({ ...demoUser, identityVerificationStatus: status })}
              onNotesChange={(notes) => setDemoUser({ ...demoUser, identityNotes: notes })}
            />
          </div>
        ) : null}

        <section className="mt-8 space-y-3" data-testid="manual-id-operator-demo">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Sintetički demo — ručna provjera identiteta (F5-UI-2)
          </h2>
          <p className="text-xs text-text-secondary">
            Lokalni operator MVP — non-biometric, sintetički kandidat, bez produkcijske verifikacije.
          </p>
          <ManualIdentityReviewPanel
            user={demoUser}
            onStatusChange={(status) => setDemoUser({ ...demoUser, identityVerificationStatus: status })}
            onNotesChange={(notes) => setDemoUser({ ...demoUser, identityNotes: notes })}
          />
        </section>
      </div>

      <Dialog open={edit !== null} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" data-testid="user-registry-edit-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand" aria-hidden />
              Uredi korisnika
            </DialogTitle>
            <DialogDescription>
              Polja za certifikaciju i usklađenost. Promjene se bilježe u audit log (USER_REGISTRY_ADMIN_UPDATE).
            </DialogDescription>
          </DialogHeader>
          {edit ? (
            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="ur-email">Email</Label>
                <Input id="ur-email" value={edit.email} readOnly className="bg-surface-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ur-name">Ime i prezime (jedno polje)</Label>
                <Input
                  id="ur-name"
                  value={edit.fullName ?? ""}
                  onChange={(e) => {
                    setEdit({ ...edit, fullName: e.target.value });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ur-role">Uloga</Label>
                <Input
                  id="ur-role"
                  value={edit.role}
                  onChange={(e) => {
                    setEdit({ ...edit, role: e.target.value.toLowerCase() });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ur-phone">Telefon</Label>
                <Input
                  id="ur-phone"
                  value={edit.phone ?? ""}
                  onChange={(e) => {
                    setEdit({ ...edit, phone: e.target.value });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ur-jmbg">JMBG / nacionalni ID</Label>
                <Input
                  id="ur-jmbg"
                  value={edit.nationalId ?? ""}
                  onChange={(e) => {
                    setEdit({ ...edit, nationalId: e.target.value });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ur-job">Pozicija</Label>
                <Input
                  id="ur-job"
                  value={edit.jobTitle ?? ""}
                  onChange={(e) => {
                    setEdit({ ...edit, jobTitle: e.target.value });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ur-edu">Stručna sprema</Label>
                <Input
                  id="ur-edu"
                  value={edit.educationLevel ?? ""}
                  onChange={(e) => {
                    setEdit({ ...edit, educationLevel: e.target.value });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ur-org">Organizacija</Label>
                <select
                  id="ur-org"
                  className="h-10 w-full rounded-md border border-border/60 bg-surface-primary px-3 text-sm text-text-primary"
                  value={edit.organizationId ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEdit({
                      ...edit,
                      organizationId: v || null,
                      organizationName: v ? orgNameById.get(v) ?? null : null,
                    });
                  }}
                >
                  <option value="">— bez organizacije —</option>
                  {orgOptions.map((o) => (
                    <option key={o.organizationId} value={o.organizationId}>
                      {o.legalName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ur-vstat">Status verifikacije dokumenata</Label>
                <select
                  id="ur-vstat"
                  className="h-10 w-full rounded-md border border-border/60 bg-surface-primary px-3 text-sm text-text-primary"
                  value={edit.identityVerificationStatus}
                  onChange={(e) => {
                    setEdit({
                      ...edit,
                      identityVerificationStatus: e.target.value as IdentityVerificationStatus,
                    });
                  }}
                >
                  <option value="none">none</option>
                  <option value="pending">pending</option>
                  <option value="verified">verified</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ur-notes">Interna napomena (SME)</Label>
                <textarea
                  id="ur-notes"
                  rows={3}
                  className="w-full rounded-md border border-border/60 bg-surface-primary px-3 py-2 text-sm text-text-primary"
                  value={edit.identityNotes ?? ""}
                  onChange={(e) => {
                    setEdit({ ...edit, identityNotes: e.target.value });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ur-idkey">S3 ključ — sken ID</Label>
                <Input
                  id="ur-idkey"
                  value={edit.identityDocumentIdKey ?? ""}
                  onChange={(e) => {
                    setEdit({ ...edit, identityDocumentIdKey: e.target.value });
                  }}
                  placeholder="npr. uploads/user-xxx/id-card.pdf"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ur-dipkey">S3 ključ — diploma</Label>
                <Input
                  id="ur-dipkey"
                  value={edit.identityDocumentDiplomaKey ?? ""}
                  onChange={(e) => {
                    setEdit({ ...edit, identityDocumentDiplomaKey: e.target.value });
                  }}
                />
              </div>

              <ManualIdentityReviewPanel
                user={edit}
                disabled={saveM.isPending}
                onStatusChange={(status) => setEdit({ ...edit, identityVerificationStatus: status })}
                onNotesChange={(notes) => setEdit({ ...edit, identityNotes: notes })}
              />
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setEdit(null)}>
              Otkaži
            </Button>
            <Button type="button" disabled={saveM.isPending} onClick={() => void saveM.mutateAsync()}>
              {saveM.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Spremanje…
                </>
              ) : (
                "Spremi"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={orgDialog} onOpenChange={setOrgDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova organizacija</DialogTitle>
            <DialogDescription>Pravno lice za povezivanje polaznika (company).</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="no-name">Naziv</Label>
              <Input
                id="no-name"
                value={newOrg.legalName}
                onChange={(e) => {
                  setNewOrg({ ...newOrg, legalName: e.target.value });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="no-reg">Registracijski broj</Label>
              <Input
                id="no-reg"
                value={newOrg.registrationNumber}
                onChange={(e) => {
                  setNewOrg({ ...newOrg, registrationNumber: e.target.value });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="no-country">Država</Label>
              <Input
                id="no-country"
                value={newOrg.country}
                onChange={(e) => {
                  setNewOrg({ ...newOrg, country: e.target.value });
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOrgDialog(false)}>
              Otkaži
            </Button>
            <Button type="button" disabled={createOrgM.isPending || !newOrg.legalName.trim()} onClick={() => void createOrgM.mutateAsync()}>
              {createOrgM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kreiraj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
