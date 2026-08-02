import type { MePermissionsPayload } from "@/lib/permissions";

export type DashboardOutletContext = {
  readonly user: {
    readonly name: string;
    readonly email: string;
    /** Uloga iz profila (npr. learner, admin, instructor). */
    readonly role: string;
  };
  /** Efektivne ovlasti s API-ja (opcionalno). */
  readonly effectivePermissions: MePermissionsPayload | null;
};
