import type { JSX } from "react";

/** Programme administration has no Nest API in this baseline. */
export default function AdminEducationPage(): JSX.Element {
  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8" data-testid="admin-education-page">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold text-text-primary" data-testid="admin-education-heading">
          Upravljanje edukacijama
        </h1>
        <p className="text-sm text-text-secondary" data-testid="admin-education-not-implemented">
          Upravljanje edukacijama još nije provedeno. API za administraciju programa, upisa i izvještaja edukacije ne postoji, pa se ovdje ne prikazuju podaci.
        </p>
        <p className="text-sm text-text-secondary" data-testid="admin-education-readonly-badge">
          Ovo nije odluka po ISO/IEC 17024 i ne mijenja objavljene programe.
        </p>
      </div>
    </div>
  );
}
