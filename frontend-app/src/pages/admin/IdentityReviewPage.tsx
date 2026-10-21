/**
 * F5-UI-4 — Nest-backed identity review queue on dedicated route.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState, type JSX } from "react";
import { Link, useOutletContext } from "react-router";

import { ControlledDocumentAccessPanel } from "@/components/admin/ControlledDocumentAccessPanel";
import { ManualIdentityReviewPanel } from "@/components/admin/ManualIdentityReviewPanel";
import { Button } from "@/components/ui/button";
import {
  fetchStaffIdentityQueue,
  patchStaffIdentityReview,
  type NestIdentityQueueStatus,
  type StaffIdentityQueueItem,
} from "@/lib/api-staff-identity-review";
import {
  fetchSysadminIdentityQueue,
  isSysadminCrossTenantQueueRole,
  type SysadminIdentityQueueItem,
} from "@/lib/api-sysadmin-identity-queue";
import type { IdentityVerificationStatus, UserRegistryRow } from "@/lib/api-user-registry";
import { resolveActorNestRoles } from "@/lib/certification-assignment-access";
import {
  canPerformStaffIdentityReview,
  shouldLoadStaffIdentityQueue,
} from "@/lib/staff-identity-review-access";
import { extractRealmRolesFromToken } from "@/lib/jwt-payload";
import type { DashboardOutletContext } from "@/pages/dashboard/dashboard-outlet-context";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

const QUEUE_KEY = ["staff", "identity-review", "queue"] as const;
const SYSADMIN_QUEUE_KEY = ["sysadmin", "identity-review", "queue"] as const;

const DEMO_SYNTHETIC_USER: UserRegistryRow = {
  userId: "b2000000-0000-4000-8000-000000000001",
  email: "pilot.learner@confora.test",
  fullName: "Pilot Learner (synthetic demo)",
  role: "learner",
  nationalId: "0000000000000",
  identityVerificationStatus: "pending",
  identityNotes: "F5-UI-4 synthetic fallback — queue empty or RBAC blocked",
  identityDocumentIdKey: "uploads/demo/synthetic-id-scan.pdf",
  identityDocumentDiplomaKey: null,
};

function mapNestStatusToRegistry(status: NestIdentityQueueStatus): IdentityVerificationStatus {
  switch (status) {
    case "VERIFIED":
      return "verified";
    case "REJECTED":
      return "rejected";
    default:
      return "pending";
  }
}

function mapRegistryStatusToNest(status: IdentityVerificationStatus): NestIdentityQueueStatus {
  switch (status) {
    case "verified":
      return "VERIFIED";
    case "rejected":
      return "REJECTED";
    default:
      return "PENDING";
  }
}

function queueItemToUserRow(item: StaffIdentityQueueItem, notes: string): UserRegistryRow {
  return {
    userId: item.userId,
    email: item.email,
    fullName: item.fullName,
    role: "learner",
    identityVerificationStatus: mapNestStatusToRegistry(item.status),
    identityNotes: notes,
    identityDocumentIdKey: item.documentKey,
    identityDocumentDiplomaKey: null,
  };
}

export default function IdentityReviewPage(): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  const jwtRoles = useMemo(() => extractRealmRolesFromToken(accessToken), [accessToken]);

  const canPerformReview = useMemo(
    () =>
      canPerformStaffIdentityReview({
        jwtRoles,
        roleFromProfile: user.role,
      }),
    [jwtRoles, user.role],
  );

  const canLoadQueue = useMemo(
    () =>
      shouldLoadStaffIdentityQueue({
        jwtRoles,
        roleFromProfile: user.role,
      }),
    [jwtRoles, user.role],
  );

  const isSysadminActor = useMemo(() => isSysadminCrossTenantQueueRole(jwtRoles), [jwtRoles]);

  const nestRoles = useMemo(
    () =>
      resolveActorNestRoles({
        jwtRoles,
        roleFromProfile: user.role,
      }),
    [jwtRoles, user.role],
  );

  const queueQ = useQuery({
    queryKey: QUEUE_KEY,
    queryFn: () => fetchStaffIdentityQueue(),
    enabled: canLoadQueue,
  });

  const sysadminQueueQ = useQuery({
    queryKey: SYSADMIN_QUEUE_KEY,
    queryFn: () => fetchSysadminIdentityQueue(),
    enabled: isSysadminActor,
  });

  const items = queueQ.data?.items ?? [];
  const sysadminItems = sysadminQueueQ.data ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [demoUser, setDemoUser] = useState<UserRegistryRow>(DEMO_SYNTHETIC_USER);

  const selected = useMemo(
    () => items.find((i) => i.verificationId === selectedId) ?? items[0] ?? null,
    [items, selectedId],
  );

  const patchM = useMutation({
    mutationFn: async (input: { verificationId: string; status: IdentityVerificationStatus; notes: string }) => {
      await patchStaffIdentityReview(input.verificationId, {
        status: mapRegistryStatusToNest(input.status),
        note: input.notes.trim() || undefined,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QUEUE_KEY });
    },
  });

  const useNestQueue = canLoadQueue && !queueQ.isError && items.length > 0;
  const showDemoFallback = !useNestQueue;

  const panelUser = useNestQueue && selected
    ? queueItemToUserRow(selected, notesById[selected.verificationId] ?? "")
    : demoUser;

  const panelDisabled = !canPerformReview || !useNestQueue || patchM.isPending;

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
              <ShieldCheck className="h-6 w-6 text-brand" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary" data-testid="identity-review-heading">
                Ručna provjera identiteta
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                §12.1 — Nest identity queue (tenant-scoped). Non-biometric MVP — ne certificira kandidata.
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/dashboard/admin/users">
              <Users className="mr-2 h-4 w-4" aria-hidden />
              Registar korisnika
            </Link>
          </Button>
        </header>

        <p className="mb-4 text-sm text-text-muted" data-testid="identity-review-route-note">
          Izvor: <code className="text-xs">GET /v1/staff/identity-review/queue</code> (čitanje:{" "}
          STAFF_ID_VERIFIER, STAFF_DIR nadzor). Izmjene:{" "}
          <code className="text-xs">PATCH …/queue/:id</code> (samo STAFF_ID_VERIFIER).
        </p>

        {!canPerformReview ? (
          <p
            className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-text-secondary"
            data-testid="identity-review-readonly-banner"
          >
            Pregled nadzora — nemate ovlasti za izmjenu statusa provjere identiteta (D-04). Operativne
            odluke izvršava ručni verifikator identiteta.
          </p>
        ) : null}

        {isSysadminActor ? (
          <section
            className="mb-6 rounded-xl border border-brand/30 bg-brand/5 p-4"
            data-testid="identity-queue-sysadmin-cross-tenant"
          >
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-brand">
              Sysadmin — cross-tenant identity queue
            </h2>
            <p className="mb-3 text-xs text-text-muted" data-testid="identity-queue-sysadmin-indicator">
              STAFF_SYSADM · cross-tenant · metadata only · no public document URLs · non-biometric MVP
            </p>
            {sysadminQueueQ.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden />
                Učitavanje sysadmin queue…
              </div>
            ) : sysadminQueueQ.isError ? (
              <p className="text-sm text-amber-200">Sysadmin queue nije dostupan.</p>
            ) : (
              <ul className="divide-y divide-border/40 rounded-lg border border-border/50 bg-surface-secondary/30">
                {sysadminItems.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-text-muted">Nema stavki u cross-tenant redu.</li>
                ) : (
                  sysadminItems.map((item: SysadminIdentityQueueItem) => (
                    <li
                      key={item.verificationId}
                      className="px-4 py-3 text-sm"
                      data-testid={`sysadmin-identity-queue-item-${item.verificationId}`}
                    >
                      <span className="font-medium text-text-primary">{item.fullName}</span>
                      <span className="mt-1 block text-xs text-text-muted">
                        {item.email} · tenant {(item.tenantId?.slice(0, 8) || "—")}… · {item.docType} · {item.status}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </section>
        ) : null}

        {queueQ.isLoading ? (
          <div className="mb-6 flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden />
            Učitavanje Nest identity queue…
          </div>
        ) : null}

        {useNestQueue ? (
          <section className="mb-6" data-testid="identity-queue-nest-list">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
              Red čekanja ({items.length})
            </h2>
            <ul className="divide-y divide-border/40 rounded-xl border border-border/50 bg-surface-secondary/30">
              {items.map((item) => (
                <li key={item.verificationId}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full flex-col gap-1 px-4 py-3 text-left text-sm hover:bg-surface-primary/40",
                      selected?.verificationId === item.verificationId && "bg-brand/10",
                    )}
                    data-testid={`identity-queue-item-${item.verificationId}`}
                    onClick={() => setSelectedId(item.verificationId)}
                  >
                    <span className="font-medium text-text-primary">{item.fullName}</span>
                    <span className="text-xs text-text-muted">
                      {item.email} · {item.docType} · {item.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {showDemoFallback ? (
          <p
            className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"
            data-testid="identity-queue-demo-fallback"
          >
            {queueQ.isError
              ? "Nest identity queue nije dostupan — prikazujemo označeni sintetički demo."
              : items.length === 0
                ? "Red čekanja je prazan — prikazujemo označeni sintetički demo."
                : "RBAC ne dozvoljava queue — sintetički demo."}
          </p>
        ) : null}

        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <ControlledDocumentAccessPanel
            title="Dokument identiteta (storage ključ)"
            storageKey={panelUser.identityDocumentIdKey}
            statusLabel={panelUser.identityVerificationStatus}
            testIdPrefix="identity-doc-id"
            documentKind="identity_evidence"
            verificationId={useNestQueue && selected ? selected.verificationId : undefined}
            previewEnabled={Boolean(useNestQueue && selected)}
          />
          <ControlledDocumentAccessPanel
            title="Dodatni credential ključ"
            storageKey={panelUser.identityDocumentDiplomaKey}
            testIdPrefix="identity-doc-diploma"
          />
        </div>

        <ManualIdentityReviewPanel
          user={panelUser}
          disabled={panelDisabled}
          onStatusChange={(status) => {
            if (useNestQueue && selected) {
              const notes = notesById[selected.verificationId] ?? "";
              void patchM.mutateAsync({
                verificationId: selected.verificationId,
                status,
                notes,
              });
            } else {
              setDemoUser({ ...demoUser, identityVerificationStatus: status });
            }
          }}
          onNotesChange={(notes) => {
            if (useNestQueue && selected) {
              setNotesById((prev) => ({ ...prev, [selected.verificationId]: notes }));
            } else {
              setDemoUser({ ...demoUser, identityNotes: notes });
            }
          }}
        />
      </div>
    </div>
  );
}
