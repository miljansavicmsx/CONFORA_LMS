import { useQuery } from "@tanstack/react-query";
import type { JSX } from "react";

import { fetchAdminNotificationTemplates } from "@/lib/api-notifications";

export default function NotificationsAdminPage(): JSX.Element {
  const q = useQuery({
    queryKey: ["admin", "notification-templates"] as const,
    queryFn: fetchAdminNotificationTemplates,
  });

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-text-primary">Admin: predlošci obavještenja</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Uređivanje MJML-a, verzija i STAFF_DIR objave: Next.js admin na{" "}
          <code className="rounded bg-surface-primary px-1">/admin/notification-templates</code> (koristite osoban JWT
          prema Nest API-ju).
        </p>
        <pre className="mt-6 max-h-[480px] overflow-auto rounded-xl border border-border/50 bg-surface-primary p-4 text-xs text-text-secondary">
          {JSON.stringify(q.data ?? [], null, 2)}
        </pre>
      </div>
    </div>
  );
}
