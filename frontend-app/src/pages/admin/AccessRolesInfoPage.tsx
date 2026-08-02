import type { JSX } from "react";

/**
 * Stub za „Roles & permissions” — autoritativna matrica u repozitoriju `docs/CONFORA_ACCESS_ROLES_REPORT.md`.
 */
export default function AccessRolesInfoPage(): JSX.Element {
  return (
    <div className="min-h-0 flex-1 overflow-hidden px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-3">
        <h1 className="text-2xl font-bold text-text-primary">Roles &amp; permissions</h1>
        <p className="text-sm text-text-secondary">
          Uloge dolaze iz DynamoDB profila (`role`) i Cognito grupa gdje backend dopušta zamjenski pristup. Ova stranica ne
          duplicira cijelu matricu; koristite tehnički izvještaj uz repozitorij.
        </p>
        <div className="h-[min(520px,70vh)] overflow-auto rounded-xl border border-border/50 bg-surface-primary/50 p-4 text-sm">
          <pre className="whitespace-pre-wrap font-mono text-xs text-text-secondary">
            Dokumentacija: docs/CONFORA_ACCESS_ROLES_REPORT.md Docs/JSON matrica:
            docs/CONFORA_ACCESS_ROLES_MATRIX.json Sidebar i route guardovi koriste skupove definirane u:
            frontend-app/src/lib/iso-navigation-access.ts frontend-app/src/lib/certification-committee-access.ts
            frontend-app/src/lib/certification-staff-queue-access.ts
          </pre>
        </div>
      </div>
    </div>
  );
}
