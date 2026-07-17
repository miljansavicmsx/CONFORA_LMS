import { MessageSquareWarning } from "lucide-react";
import { type JSX, Suspense, lazy } from "react";
import { Link } from "react-router";

import { evaluateStaffAppealsComplaintsAccess } from "@/lib/staff-appeals-complaints-access";
import { isCertificationCandidate, type IsoNavContext } from "@/lib/iso-navigation-access";
import { useAuthStore } from "@/stores/authStore";

import { IsoPageShell } from "./IsoPageShell";

const StaffAppealsComplaintsPage = lazy(() => import("@/pages/staff/StaffAppealsComplaintsPage"));

/**
 * ISO complaints entry — candidates see intake guidance;
 * staff see APPEALS-COMPLAINTS-2 resolution UX (prigovori tab via shared page).
 */
export default function ComplaintsIsoPage(): JSX.Element {
  const cognitoGroups = useAuthStore((s) => s.cognitoGroups);
  const role = useAuthStore((s) => s.user?.role ?? "");
  const ctx: IsoNavContext = { role, cognitoGroups };
  const candidate = isCertificationCandidate(ctx);
  const staff = evaluateStaffAppealsComplaintsAccess({ roleFromProfile: role });

  if (staff && !candidate) {
    return (
      <Suspense
        fallback={
          <div className="p-8 text-sm text-text-secondary" data-testid="staff-complaints-iso-loading">
            Učitavanje prigovora…
          </div>
        }
      >
        <StaffAppealsComplaintsPage initialTab="complaints" />
      </Suspense>
    );
  }

  return (
    <IsoPageShell
      title="Prigovori"
      description="Evidencija i obrada prigovora na proces certifikacije i prateće usluge. Prigovor nije žalba."
      icon={MessageSquareWarning}
    >
      <div className="rounded-2xl border border-border/50 bg-surface-secondary/40 p-6" data-testid="complaints-iso-candidate-guidance">
        <p className="text-sm leading-relaxed text-text-secondary">
          Za podnošenje žalbe ili prigovora koristite{" "}
          <Link
            to="/dashboard/appeals-complaints"
            className="font-medium text-brand underline-offset-4 hover:underline"
          >
            Žalbe i prigovori
          </Link>
          . Opći kontakt / podrška:{" "}
          <Link to="/dashboard/support" className="font-medium text-brand underline-offset-4 hover:underline">
            Podrška
          </Link>
          . Javni obrazac:{" "}
          <Link to="/podnesi-predmet" className="font-medium text-brand underline-offset-4 hover:underline">
            /podnesi-predmet
          </Link>
          .
        </p>
        {staff ? (
          <p className="mt-3 text-sm text-text-secondary">
            Osoblje:{" "}
            <Link
              to="/dashboard/admin/appeals-complaints"
              className="font-medium text-brand underline-offset-4 hover:underline"
            >
              /dashboard/admin/appeals-complaints
            </Link>
          </p>
        ) : null}
      </div>
    </IsoPageShell>
  );
}
