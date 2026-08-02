import type { JSX } from "react";

import { Link } from "react-router";

/**
 * Kratak sistemski sigurnosni hub (detaljnije javno na `/security`).
 */
export default function DashboardSecurityInfoPage(): JSX.Element {
  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">Security</h1>
        <p className="text-sm text-text-secondary">
          CONFORA prati ISO/IEC 17024 procesne zahtjeve uz audit trag, SSO i tenant izolaciju. Operativnu konfiguraciju(
          JWT, KMS, SMTP) provjerite na backendu i u DevOps dokumentaciji projekta.
        </p>
        <Link to="/security" className="text-sm font-medium text-brand hover:underline">
          Javni security pregled →
        </Link>
      </div>
    </div>
  );
}
