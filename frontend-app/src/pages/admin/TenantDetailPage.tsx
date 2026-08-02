import { type JSX } from "react";
import { useParams } from "react-router";

export default function TenantDetailPage(): JSX.Element {
  const { tenantId } = useParams();
  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-text-primary">Tenant {tenantId}</h1>
        <p className="mt-2 text-text-secondary">
          Support operations placeholder: timeline, resend notification, audit trail, safe impersonation (read-only default).
        </p>
      </div>
    </div>
  );
}

